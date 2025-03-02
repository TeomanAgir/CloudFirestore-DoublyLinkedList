import { db } from "./firebase.js";
import { doc, setDoc } from "firebase/firestore";

// 🔥 **Şehir ekleme fonksiyonu**
async function addCity(cityId, cityName, prev, next) {
    await setDoc(doc(db, "Sehirler", cityId), {
        cityId: cityId,
        cityName: cityName,
        prev: prev,
        next: next
    });
    console.log(`🏙️ Şehir eklendi: ${cityName}`);
}

// 🔥 **İlçe ekleme fonksiyonu**
async function addDistrict(districtId, districtName, cityId, prev, next) {
    await setDoc(doc(db, "Ilceler", districtId), {
        districtId: districtId,
        districtName: districtName,
        cityId: cityId,
        prev: prev,
        next: next
    });
    console.log(`📍 İlçe eklendi: ${districtName}`);
}

// 🔥 **Mahalle ekleme fonksiyonu (Prev-Next Dahil)**
async function addNeighborhood(neighId, neighName, districtId, postCode, prev, next) {
    await setDoc(doc(db, "Mahalleler", neighId), {
        neighId: neighId,
        neighName: neighName,
        districtId: districtId,
        postCode: postCode,
        prev: prev,  
        next: next   
    });
    console.log(`🏡 Mahalle eklendi: ${neighName}`);
}

// 🔥 **Eczane ekleme fonksiyonu (Prev-Next Dahil)**
async function addPharmacy(pharId, pharName, neighId, address, prev, next) {
    await setDoc(doc(db, "Eczaneler", pharId), {
        pharId: pharId,
        pharName: pharName,
        neighId: neighId,
        address: address,
        prev: prev,  // 🔗 Önceki eczane bağlantısı
        next: next   // 🔗 Sonraki eczane bağlantısı
    });
    console.log(`🏥 Eczane eklendi: ${pharName}`);
}

// 🔥 **Ürün ekleme fonksiyonu**
async function addProduct(productId, productName, pharId, category, stock, prev, next) {
    await setDoc(doc(db, "Urunler", productId), {
        productId: productId,
        productName: productName,
        pharId: pharId,
        category: category,
        stock: stock,
        prev: prev,
        next: next
    });
    console.log(`🛒 Ürün eklendi: ${productName} (Stok: ${stock})`);
}

// 🔥 **Firestore’a tüm verileri ekleyelim**
// **Şehirler**
await addCity("06", "Ankara", null, "34");
await addCity("34", "İstanbul", "06", "22");
await addCity("22", "Edirne", "34", null);

// **İlçeler**
await addDistrict("cankaya", "Çankaya", "06", null, "kecioren");
await addDistrict("kecioren", "Keçiören", "06", "cankaya", null);

await addDistrict("kadikoy", "Kadıköy", "34", null, "besiktas");
await addDistrict("besiktas", "Beşiktaş", "34", "kadikoy", null);

await addDistrict("merkez", "Merkez", "22", null, null);

// **Mahalleler**
await addNeighborhood("kizilay", "Kızılay", "cankaya", "06830", null, "bahcelievler");
await addNeighborhood("bahcelievler", "Bahçelievler", "cankaya", "06840", "kizilay", null);

await addNeighborhood("moda", "Moda", "kadikoy", "81620", "göztepe", "fenerbahce");
await addNeighborhood("göztepe", "Göztepe", "kadikoy", "81630", null, "moda");
await addNeighborhood("fenerbahce", "Fenerbahçe", "kadikoy", "81640", "moda", null);

await addNeighborhood("sukrupasa", "Şükrüpaşa", "merkez", "22100", null, "yeniimaret");
await addNeighborhood("yeniimaret", "Yeniimaret", "merkez", "22110", "sukrupasa", null);

await addNeighborhood("bebek", "Bebek", "besiktas", "34342", null, "arnavutkoy");
await addNeighborhood("arnavutkoy", "Arnavutköy", "besiktas", "34345", "bebek", "levent");
await addNeighborhood("levent", "Levent", "besiktas", "34330", "arnavutkoy", null);

// **Eczaneler**
await addPharmacy("ecz001", "Güneş Eczanesi", "moda", "Bağdat Cad. No: 45, Moda, Kadıköy, İstanbul", null, "ecz002");
await addPharmacy("ecz002", "Oğuz Eczanesi", "moda", "Yoğurtçu Parkı Cad. No: 12, Kadıköy, İstanbul", "ecz001", "ecz003");
await addPharmacy("ecz003", "Cankurtaran Eczanesi", "moda", "Söğütlüçeşme Cad. No: 10, Kadıköy, İstanbul", "ecz002", null);

await addPharmacy("ecz004", "Beşiktaş Eczanesi", "göztepe", "Beşiktaş Mah. No: 24, İstanbul", null, "ecz005");
await addPharmacy("ecz005", "Levent Eczanesi", "göztepe", "Levent Mah. No: 12, İstanbul", "ecz004", null);

await addPharmacy("ecz006", "Kızılay Eczanesi", "kizilay", "Atatürk Bulv. No: 34, Ankara", null, "ecz007");
await addPharmacy("ecz007", "Bahçelievler Eczanesi", "bahcelievler", "Gazi Cad. No: 67, Ankara", "ecz006", null);

await addPharmacy("ecz008", "Edirne Merkez Eczanesi", "sukrupasa", "Şükrüpaşa Cad. No: 10, Edirne", null, "ecz009");
await addPharmacy("ecz009", "Yeniimaret Eczanesi", "yeniimaret", "Yeniimaret Mah. No: 8, Edirne", "ecz008", "ecz010");

await addPharmacy("ecz010", "zartzurt Eczanesi", "fenerbahce", "Yeniimaret Mah. No: 8, Edirne", "ecz009", null);

// **Ürünler**
await addProduct("cerave_1367", "Cerave Krem", "ecz001", "Cilt Bakımı", 25, null, "bioderma_1109");
await addProduct("bioderma_1109", "Bioderma Jel", "ecz002", "Cilt Bakımı", 15, "cerave_1367", "hiq8874");
await addProduct("hiq8874", "HIQ Kreatin", "ecz003", "Sporcu Besinleri", 30, "bioderma_1109", null);

await addProduct("parol_500", "Parol 500mg", "ecz004", "Ağrı Kesici", 50, null, "ibuprofen_400");
await addProduct("ibuprofen_400", "Ibuprofen 400mg", "ecz005", "Ağrı Kesici", 40, "parol_500", null);

await addProduct("omeprazol_20", "Omeprazol 20mg", "ecz006", "Mide Koruyucu", 60, null, "pantoprazol_40");
await addProduct("pantoprazol_40", "Pantoprazol 40mg", "ecz007", "Mide Koruyucu", 55, "omeprazol_20", null);

await addProduct("aspirin_100", "Aspirin 100mg", "ecz008", "Kan Sulandırıcı", 70, null, "xarelto_20");
await addProduct("xarelto_20", "Xarelto 20mg", "ecz009", "Kan Sulandırıcı", 30, "aspirin_100", null);
await addProduct("xarelto_20", "Xarelto 20mg", "ecz009", "Kan Sulandırıcı", 30, "aspirin_100", null);
await addProduct("parol_500", "Parol 500mg", "ecz010", "Ağrı Kesici", 50, null, "ibuprofen_400");

console.log("✅ **Tüm veriler Firestore’a eklendi!**");
