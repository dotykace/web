import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyDO91d2qBIVHxpZ0dyAIDRe5LvByj99M_M",
    authDomain: "dotykace.firebaseapp.com",
    projectId: "dotykace",
    storageBucket: "dotykace.firebasestorage.app",
    messagingSenderId: "195051131662",
    appId: "1:195051131662:web:f1a69fafda822d6a577d5f",
    measurementId: "G-YBX1F64JRJ",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
