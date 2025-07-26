"use client"

import { useAuth } from "@/composables/useAuthUser"
import { navigateTo, defineNuxtRouteMiddleware } from "#app"

export default defineNuxtRouteMiddleware((to, from) => {
  const { currentUser, authInitialized } = useAuth()

  // Jika autentikasi belum diinisialisasi, tunggu sebentar atau tangani loading state
  // Ini penting karena onAuthStateChanged adalah async
  if (!authInitialized.value) {
    // Anda bisa menambahkan logika loading di sini, atau
    // mengembalikan undefined untuk membiarkan navigasi berlanjut sementara menunggu
    // atau mengarahkan ke halaman loading.
    // Untuk saat ini, kita akan membiarkannya berlanjut dan mengandalkan redirect jika user null.
    // Namun, pendekatan yang lebih robust mungkin melibatkan menunggu authInitialized menjadi true.
  }

  // Jika pengguna tidak login DAN rute yang dituju BUKAN halaman login/register
  if (!currentUser.value && to.path !== "/login" && to.path !== "/register") {
    return navigateTo("/login")
  }
})
