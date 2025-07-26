import tailwindcss from "@nuxtjs/tailwindcss"

export default defineNuxtConfig({
  compatibilityDate: "2025-07-11",
  devtools: { enabled: true },
 
  runtimeConfig: {
    public: {
      // ✅ PERBAIKAN: Akses variabel lingkungan dengan prefix NUXT_PUBLIC_
      FIREBASE_API_KEY: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      FIREBASE_MEASUREMENT_ID: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Pastikan ini juga diakses dengan NUXT_PUBLIC_
    },
  },
  css: ["~/assets/css/main.css"],
  plugins: [{ src: "~/plugins/firebase.client.ts", mode: "client" }],
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt"],
  tailwindcss: {
    // ✅ Konfigurasi @nuxtjs/tailwindcss
    cssPath: "~/assets/css/main.css",
    configPath: "tailwind.config.js",
    exposeConfig: false,
    viewer: true,
  },
  shadcn: {
    prefix: "",
    componentDir: "./components/ui",
  },
})
