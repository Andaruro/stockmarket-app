import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCUkIXvK0PToDhju3OSXJaHHErZCxVnITE",
  authDomain: "stockmarket-478ac.firebaseapp.com",
  projectId: "stockmarket-478ac",
  storageBucket: "stockmarket-478ac.firebasestorage.app",
  messagingSenderId: "302909965815",
  appId: "1:302909965815:web:cb68a98f32c843ff3fdaf2",
  measurementId: "G-WLJV0RWKP2"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);