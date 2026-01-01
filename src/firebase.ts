import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const requiredKeys = ['apiKey', 'projectId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
    console.error(`Firebase Config Error: Missing environment variables for: ${missingKeys.join(', ')}. Check your Vercel Project Settings.`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Offline persistence disabled to prevent "Invalid Segment" loops and cache corruption
// enableMultiTabIndexedDbPersistence(db).catch((err) => console.warn('Persistence error', err));
