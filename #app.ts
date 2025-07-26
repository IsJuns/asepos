export const useNuxtApp = () => {
  return {
    $firebase: {
      auth: {},
      db: {},
    },
  }
}

export const navigateTo = (path: string) => {
  window.location.href = path
}

export const defineNuxtRouteMiddleware = (middleware: Function) => {
  return middleware
}

export const defineNuxtPlugin = (plugin: Function) => {
  return plugin
}

export const useRuntimeConfig = () => {
  return {
    public: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    },
  }
}
