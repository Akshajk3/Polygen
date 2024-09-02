// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);