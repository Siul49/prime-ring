import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Firebase 초기화 (옵셔널)
let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null

if (firebaseConfig.apiKey) {
    try {
        app = initializeApp(firebaseConfig)
        db = getFirestore(app)
        auth = getAuth(app)
        console.log('🔥 Firebase initialized:', firebaseConfig.projectId)
    } catch (error) {
        console.warn('⚠️ Firebase initialization failed:', error)
    }
} else {
    console.info('ℹ️ Firebase not configured. Using local storage only.')
    console.info('   To enable Firebase sync, create .env.local with VITE_FIREBASE_* variables.')
}

export { app, db, auth }
