import { useNuxtApp } from "#app"
import type { Auth } from "firebase/auth"
import type { Firestore } from "firebase/firestore"

interface FirebaseComposable {
  auth: Auth
  db: Firestore
}

export const useFirebase = (): FirebaseComposable => {
  const nuxtApp = useNuxtApp()

  // Memastikan instance sudah tersedia dari plugin
  if (!nuxtApp.$auth || !nuxtApp.$db) {
    throw new Error(
      "Firebase instances not provided by plugin. Ensure plugins/firebase.client.ts is correctly configured and running.",
    )
  }

  return {
    auth: nuxtApp.$auth as Auth,
    db: nuxtApp.$db as Firestore,
  }
}