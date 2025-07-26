<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { definePageMeta } from '#imports'
import type { Auth } from 'firebase/auth'

const router = useRouter()
const isLoggingOut = ref(true)

definePageMeta({
  middleware: ['auth'], // Pastikan hanya pengguna terautentikasi yang bisa mengakses ini
})

const { useNuxtApp } = await import('#app')
const { $firebase } = useNuxtApp()
const auth: Auth | null = $firebase?.auth || null

onMounted(async () => {
  if (process.client) {
    try {
      if (auth) {
        const { signOut } = await import('firebase/auth')
        await signOut(auth)
        console.log('User signed out successfully.')
        router.push('/login') // Arahkan ke halaman login setelah logout
      } else {
        console.warn('Firebase Auth not initialized. Redirecting to login.')
        router.push('/login')
      }
    } catch (error) {
      console.error('Error signing out:', error)
      // Anda bisa menampilkan pesan error kepada pengguna jika logout gagal
      alert('Gagal logout. Silakan coba lagi.')
      router.push('/dashboard') // Arahkan kembali ke dashboard jika gagal logout
    }
  } else {
    router.push('/login')
  }
  isLoggingOut.value = false
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <p class="text-gray-700 dark:text-gray-300">
      {{ isLoggingOut ? 'Logging out...' : 'Redirecting...' }}
    </p>
  </div>
</template>
