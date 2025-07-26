"use client"

import { useAuth } from "@/composables/useAuthUser"
import { navigateTo, defineNuxtRouteMiddleware } from "#app"

export default defineNuxtRouteMiddleware((to, from) => {
  const { currentUser } = useAuth()
  if (currentUser.value) {
    // Jika pengguna sudah login, arahkan ke dashboard
    return navigateTo("/dashboard")
  }
})
