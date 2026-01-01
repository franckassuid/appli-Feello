import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDkFYViM4aWhoHd_G9iLF7K4CdLJvJ6yUE",
    authDomain: "feello-lappli.firebaseapp.com",
    projectId: "feello-lappli",
    storageBucket: "feello-lappli.firebasestorage.app",
    messagingSenderId: "1056782510222",
    appId: "1:1056782510222:web:fa2a89941ccfa6c1d201df"
};

const requiredKeys = ['apiKey', 'projectId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

console.log("Firebase Env Check:", {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    hasAppId: !!firebaseConfig.appId,
    raw: JSON.stringify(firebaseConfig)
});

if (missingKeys.length > 0) {
    console.error(`Firebase Config Error: Missing environment variables for: ${missingKeys.join(', ')}. Check your Vercel Project Settings.`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Offline persistence disabled to prevent "Invalid Segment" loops and cache corruption
// enableMultiTabIndexedDbPersistence(db).catch((err) => console.warn('Persistence error', err));
