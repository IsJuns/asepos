<template>
  <div class="bg-muted flex min-h-screen items-center justify-center p-6">
    <RegisterForm />
  </div>
</template>

<script setup>
import RegisterForm from '@/components/RegisterForm.vue'

definePageMeta({
  layout: 'false'
})
</script>
