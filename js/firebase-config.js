// =====================================================
// CONFIG FIREBASE
// Sostituisci con i dati del TUO progetto Firebase.
// Console: https://console.firebase.google.com/
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBVyJ0QAVBozYAFkF5dIdbVLj38KIqrM-Y",
    authDomain: "torneocossali.firebaseapp.com",
    projectId: "torneocossali",
    storageBucket: "torneocossali.firebasestorage.app",
    messagingSenderId: "54726186217",
    appId: "1:54726186217:web:15c9a644295d1ebd814c78",
    measurementId: "G-M47663VVQ6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
    db,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    increment
};
