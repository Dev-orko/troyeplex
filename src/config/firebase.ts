import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Firebase is optional — if credentials are missing the app runs in demo mode
export const isFirebaseConfigured =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'undefined'

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
  } catch (e) {
    console.warn('[Firebase] Initialization failed — running in demo mode:', e)
    app = null
    auth = null
    db = null
  }
} else {
  console.info('[Firebase] No credentials found — running in demo mode (no auth required)')
}

export { auth, db }
export default app
