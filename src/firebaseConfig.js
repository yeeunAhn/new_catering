// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVsA0IzDDWs91wHFac0F9iLVy5eRL335k",
  authDomain: "catering-86c0c.firebaseapp.com",
  databaseURL: "https://catering-86c0c-default-rtdb.firebaseio.com",
  projectId: "catering-86c0c",
  storageBucket: "catering-86c0c.appspot.com",
  messagingSenderId: "211442003318",
  appId: "1:211442003318:web:aa1cada3486d3185705e57",
  measurementId: "G-4S42KRMGB0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Realtime Database 인스턴스 가져오기
const dbRealtime = getDatabase(app);

// Firestore 인스턴스 가져오기
const dbFirestore = getFirestore(app);

export { dbRealtime, dbFirestore };
