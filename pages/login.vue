<script setup lang="ts">
import { definePageMeta } from '#imports';

definePageMeta({
  middleware: ['guest'], // Ubah dari string tunggal menjadi array
})
// ... (sisa kode LoginForm.vue Anda)
</script>

<template>
  <div class="bg-muted flex min-h-screen items-center justify-center p-6">>
    <LoginForm />
  </div>
</template>
