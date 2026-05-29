import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCRe0hwUE1_aaNnQuvEAc38UX-o4QAISOA",
  authDomain: "primogest-2926e.firebaseapp.com",
  projectId: "primogest-2926e",
  storageBucket: "primogest-2926e.firebasestorage.app",
  messagingSenderId: "800210594640",
  appId: "1:800210594640:web:d98e04ed2841dacf629a55"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Mode hors ligne
// enableIndexedDbPersistence(db) // désactivé
 const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Mode hors ligne
// enableIndexedDbPersistence(db) // désactivé 