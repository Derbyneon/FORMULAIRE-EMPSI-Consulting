// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCXVK7CPQ7Fwug-zabRnRyy6Fehn9Jd2NE",
    authDomain: "formulaire-empsi.firebaseapp.com",
    projectId: "formulaire-empsi",
    storageBucket: "formulaire-empsi.firebasestorage.app",
    messagingSenderId: "971121686068",
    appId: "1:971121686068:web:e95610cefecc4d18bd3c61",
    measurementId: "G-TRC03XRF33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
//console.log("le début des logs dans le header pur l'import et l'initialisation des éléments de firebase")

// Exposer les objets globalement
window.firebase = { app, db, analytics, addDoc, collection };

