import { defineNuxtPlugin, useRuntimeConfig } from "#app"
import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: runtimeConfig.public.FIREBASE_API_KEY as string,
    authDomain: runtimeConfig.public.FIREBASE_AUTH_DOMAIN as string,
    projectId: runtimeConfig.public.FIREBASE_PROJECT_ID as string,
    storageBucket: runtimeConfig.public.FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: runtimeConfig.public.FIREBASE_MESSAGING_SENDER_ID as string,
    appId: runtimeConfig.public.FIREBASE_APP_ID as string,
  }

  // --- TAMBAHAN UNTUK DEBUGGING ---
  console.log("Firebase Config Loaded:", firebaseConfig)
  // --- AKHIR TAMBAHAN ---

  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    console.error(
      "Firebase environment variables are not fully configured. Please check your .env file or deployment settings.",
    )
    // Anda mungkin ingin melempar error atau menangani ini dengan cara lain di aplikasi produksi
  }

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]
  const auth = getAuth(app)
  const db = getFirestore(app)

  return {
    provide: {
      firebase: {
        app,
        auth,
        db,
      },
    },
  }
})
