// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDIu12lfHAv8G7mbx_IOa0sxeamrt-aGnM",
  authDomain: "life-s-b2719.firebaseapp.com",
  databaseURL: "https://life-s-b2719-default-rtdb.firebaseio.com",
  projectId: "life-s-b2719",
  storageBucket: "life-s-b2719.appspot.com",
  messagingSenderId: "117057457834",
  appId: "1:117057457834:web:f056b3c84d95c9b0d6cad3",
  measurementId: "G-E0LWVTZFG2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const storage = getStorage();
export const auth = getAuth();