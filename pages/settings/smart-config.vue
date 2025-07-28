<script setup lang="ts">
import { definePageMeta } from '#imports'
import SmartConfigForm from '@/components/SmartConfigForm.vue'

definePageMeta({
  title: 'Pengaturan SMART',
  middleware: ['auth'],
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Pengaturan SMART</h1>
    </div>
    <SmartConfigForm />
  </div>
</template>
