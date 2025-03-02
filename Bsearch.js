import { db } from "./firebase.js";
import { collection, doc, getDoc, getDocs, query, where, runTransaction } from "firebase/firestore";

let CURRENTCITY = null;
let CURRENTDISTRICT = null;
let CURRENTNEIGH = null;
let SIPARIS_LISTESI = [];

function kaydetSiparisBilgileri(sehir, ilce, mahalle, urunler, adet) {
    CURRENTCITY = sehir;
    CURRENTDISTRICT = ilce;
    CURRENTNEIGH = mahalle;
    SIPARIS_LISTESI = urunler; // [{ productID: "cerave_1367", quantity: 10 }, { productID: "bioderma_1109", quantity: 5 }]
    
    
    console.log(` **Sipariş Bilgileri Kaydedildi:**`);
    console.log(`🏙️ Şehir: ${CURRENTCITY}, 📍 İlçe: ${CURRENTDISTRICT}, 🏡 Mahalle: ${CURRENTNEIGH}`);
    console.log(`🛒 Sipariş Edilen Ürünler:`, SIPARIS_LISTESI);
}

async function eczaneStoklariKontrolEt() {
    console.log(`🔎 **${CURRENTNEIGH} mahallesindeki eczanelerde stok kontrol ediliyor...**`);
    


    let uygunEczaneler = [];

    const eczaneSnap = await getDocs(query(collection(db, "Eczaneler"), where("neighId", "==", CURRENTNEIGH)));

    if (eczaneSnap.empty) {
        console.log("❌ **Bu mahallede eczane bulunamadı! Yeni mahalleye geçiliyor...**");
        sonrakiMahalleyeGec();
        return;
    }

    let eczaneIDs = eczaneSnap.docs.map(e => e.id);

    for (const urun of SIPARIS_LISTESI) {
        let bulunanEczaneler = [];

        const urunSnap = await getDocs(
            query(collection(db, "Urunler"), where("pharId", "in", eczaneIDs), where("productId", "==", urun.productID))
        );

        urunSnap.forEach(doc => {
            let stok = doc.data().stock;
            let pharId = doc.data().pharId; // urunun oldugu eczane id si

            if (stok >= urun.quantity) {
                bulunanEczaneler.push({ eczaneId: pharId, stock: stok });
            }
        });

        if (bulunanEczaneler.length > 0) {
            bulunanEczaneler.sort((a, b) => b.stock - a.stock); // stoga gore siralama yapiyorum su anda. Bunun amaci su anda konum almadigim icin direkt en yakini bulamiyorum, civardaki en buyuk stoktan aliyorum.
            uygunEczaneler.push({ urunID: urun.productID, eczaneListesi: bulunanEczaneler });
        }
    }

    if (uygunEczaneler.length > 0) {
        console.log(`✅ **Sipariş Alınabilir Eczaneler Bulundu:**`, uygunEczaneler);
        siparisVer(uygunEczaneler);
    } else {
        console.log("❌ **Bu mahallede yeterli stok bulunamadı! Yeni mahalleye geçiliyor...**");
        sonrakiMahalleyeGec();
    }
    console.log(`🛠️ DEBUG: Firestore’dan çekilen eczaneler:`, eczaneSnap.docs.map(e => e.data()));
}


//problem yaratabilir. 8. mahalleden sonrasi yoksa sonraki icleye gecer ama daha asagida 1,2,3,4,5,6,7. mahalleler vardir.
//**BIR USTTEKI NOT COZULDU**
async function sonrakiMahalleyeGec() {
    console.log(` **Yeni mahalleye geçiliyor... (Şu anki mahalle: ${CURRENTNEIGH})**`);

    const currentNeighRef = doc(db, "Mahalleler", CURRENTNEIGH);
    const currentNeighDoc = await getDoc(currentNeighRef);

    if (!currentNeighDoc.exists()) {
        console.log("❌ **Mevcut mahalle bulunamadı! İlçeye geçiliyor...**");
        sonrakiIlceyeGec();
        return;
    }

    const nextMahalle = currentNeighDoc.data().next;

    if (nextMahalle) {
        CURRENTNEIGH = nextMahalle;
        console.log(` **Yeni mahalleye geçildi: ${CURRENTNEIGH}**`);
        eczaneStoklariKontrolEt();
    } else {
        console.log("❌ **Bu mahallede `next` değeri `null`. İlçedeki diğer mahalleler kontrol ediliyor...**");

        const districtMahalleSnap = await getDocs(query(collection(db, "Mahalleler"), where("districtId", "==", CURRENTDISTRICT)));

        let otherMahalle = null;
        for (const mahalle of districtMahalleSnap.docs) {
            if (mahalle.id !== CURRENTNEIGH) {
                otherMahalle = mahalle.id;
                break;
            }
        }

        if (otherMahalle) {
            CURRENTNEIGH = otherMahalle;
            console.log(` **Next değeri null olduğu için yeni mahalleye geçildi: ${CURRENTNEIGH}**`);
            eczaneStoklariKontrolEt();
        } else {
            console.log("❌ **Bu ilçedeki TÜM mahalleler tarandı! Yeni ilçeye geçiliyor...**");
            sonrakiIlceyeGec();
        }
    }
}



async function sonrakiIlceyeGec() {
    console.log(`🏙️ **Şu anki ilce: ${CURRENTDISTRICT}. Yeni ilce araniyor...**`);

    const currentDistrictRef = doc(db, "Ilceler", CURRENTDISTRICT);
    const currentDistrictDoc = await getDoc(currentDistrictRef);

    if (!currentDistrictDoc.exists()) {
        console.log("❌ **ilce bulunamadi! sehir degistiriliyor...**");
        sonrakiSehireGec();
        return;
    }

    CURRENTCITY = currentDistrictDoc.data().cityId;

    console.log(`🏙️ **sehir: ${CURRENTCITY}, yeni ilceye bakiliyor...**`);

    const citySnap = await getDocs(query(collection(db, "Ilceler"), where("cityId", "==", CURRENTCITY)));

    let nextDistrict = null;
    for (const district of citySnap.docs) {
        if (district.id !== CURRENTDISTRICT) {
            nextDistrict = district.id;
            break;
        }
    }

    if (nextDistrict) {
        CURRENTDISTRICT = nextDistrict;
        console.log(`📍 **Yeni ilceye gecildi: ${CURRENTDISTRICT}**`);

        // ilk mahalleyi bul
        const newDistrictSnap = await getDocs(query(collection(db, "Mahalleler"), where("districtId", "==", CURRENTDISTRICT)));

        if (!newDistrictSnap.empty) {
            CURRENTNEIGH = newDistrictSnap.docs[0].id; // İlk mahalleyi al
            console.log(` **Yeni mahalleye geçildi: ${CURRENTNEIGH}**`);
            eczaneStoklariKontrolEt();
        } else {
            console.log("❌ **Bu ilçede mahalle bulunamadı! Yeni ilçeye geçiliyor...**");
            sonrakiIlceyeGec();
        }
    } else {
        console.log("❌ **Bu şehirde başka ilçe yok! Yeni bir şehre geçiliyor...**");
        sonrakiSehireGec();
    }
}



async function siparisVer(eczaneListesi) {
    console.log(`🛒 **Sipariş veriliyor...**`);

    const batch = runTransaction(db, async (transaction) => {
        for (const urun of eczaneListesi) {
            let eczane = urun.eczaneListesi[0]; // en usttekini al (su anlik boyle)
            
            const urunRef = doc(db, "Urunler", urun.urunID);
            const urunDoc = await transaction.get(urunRef);

            if (!urunDoc.exists()) continue;

            let newStock = urunDoc.data().stock - SIPARIS_LISTESI.find(item => item.productID === urun.urunID).quantity;
            transaction.update(urunRef, { stock: newStock });

            console.log(`✅ **${urun.urunID} ürünü ${eczane.eczaneId} eczanesinden sipariş edildi. Yeni stok: ${newStock}**`);
        }
    });

    await batch;
}


// urun kismi: [{ productID: "cerave_1367", quantity: 10 }, { productID: "bioderma_1109", quantity: 5 }] seklinde girilecek

//eger sorun cikiyorsa DB icerisinde cekmeye calistigimiz veri yoktur, su an db de cok az veri var. Onun disinda cok kez denedim
//herhangi bir kritik hata yakalayamadim
//time complexity yuksek, optimize edilmedi.

//TEST
kaydetSiparisBilgileri("34", "kadikoy", "fenerbahce", [{ productID: "parol_500", quantity: 1 }]);
eczaneStoklariKontrolEt();