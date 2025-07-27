import { useNuxtApp } from "#app"
import type { Auth } from "firebase/auth"
import type { Firestore } from "firebase/firestore"

interface FirebaseComposable {
  auth: Auth
  db: Firestore
}

export const useFirebase = (): FirebaseComposable => {
  const nuxtApp = useNuxtApp()
  // ✅ PERBAIKAN: Akses properti auth dan db dari objek $firebase
  if (!nuxtApp.$firebase || !nuxtApp.$firebase.auth || !nuxtApp.$firebase.db) {
    throw new Error(
      "Firebase instances not provided by plugin. Ensure plugins/firebase.client.ts is correctly configured and running.",
    )
  }
  return {
    auth: nuxtApp.$firebase.auth as Auth,
    db: nuxtApp.$firebase.db as Firestore,
  }
}
