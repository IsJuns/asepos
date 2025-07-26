<script setup lang="ts">
import { onMounted } from 'vue'
import { navigateTo } from '#app'
import { useAuth } from '@/composables/useAuthUser'

const { currentUser, authInitialized } = useAuth()

onMounted(() => {
  // Tunggu sebentar untuk inisialisasi auth
  setTimeout(() => {
    if (authInitialized.value) {
      if (currentUser.value) {
        navigateTo('/dashboard')
      } else {
        navigateTo('/login')
      }
    } else {
      // Jika masih belum initialized setelah timeout, arahkan ke login
      navigateTo('/login')
    }
  }, 1000) // Tunggu 1 detik
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
      <p class="text-gray-700 dark:text-gray-300">Mengarahkan...</p>
    </div>
  </div>
</template>

<style>
/* Gaya transisi halaman jika diperlukan, tapi untuk redirect cepat mungkin tidak terlihat */
.page-enter-active, .page-leave-active {
  transition: opacity 0.3s ease;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
}
</style>
