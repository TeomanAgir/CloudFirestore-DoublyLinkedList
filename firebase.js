// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVH7sVyo_cEY4DqVTE2vnPrlTOtXEVQsk",
  authDomain: "deneme-35976.firebaseapp.com",
  projectId: "deneme-35976",
  storageBucket: "deneme-35976.firebasestorage.app",
  messagingSenderId: "478847281155",
  appId: "1:478847281155:web:beddb84072d8e98dea0636",
  measurementId: "G-3G392K6DEV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
