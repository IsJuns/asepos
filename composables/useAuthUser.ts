"use client"

import { ref } from "vue"
import type { User, Auth } from "firebase/auth"
import { onAuthStateChanged } from "firebase/auth"
import { useNuxtApp } from "#app"

const currentUser = ref<User | null>(null)
const authInitialized = ref(false)

export function useAuth() {
  const nuxtApp = useNuxtApp()
  const auth: Auth | null = nuxtApp.$firebase?.auth || null

  // ✅ PERBAIKAN: Inisialisasi Firebase hanya di sisi klien
  if (process.client && !authInitialized.value) {
    if (auth) {
      onAuthStateChanged(auth, (user: User | null) => {
        currentUser.value = user
        authInitialized.value = true
      })
    } else {
      console.error("Failed to initialize auth:", "Firebase auth is not available")
      authInitialized.value = true // Set sebagai initialized meskipun gagal
    }
  } else if (!process.client) {
    // Di sisi server, pastikan status awal adalah belum terinisialisasi dan user null
    authInitialized.value = false
    currentUser.value = null
  }

  return {
    currentUser,
    authInitialized,
  }
}
