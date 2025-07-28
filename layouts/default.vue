<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'

const route = useRoute()
const hideLayoutOn = ['/register', '/login'] // Fixed typo: '/login'
const isHidden = computed(() => hideLayoutOn.includes(route.path))

// Ensure all hooks are called at the top level
const separator = Separator
</script>

<template>
  <div v-if="isHidden">
    <slot />
  </div>
  <!-- ✅ PERBAIKAN: Kontainer utama adalah flex dan mengisi tinggi viewport -->
  <!-- Hapus min-h-svh dari sini agar konten utama bisa menentukan tinggi keseluruhan -->
  <div v-else class="bg-muted flex h-svh">
    <!-- SidebarProvider membungkus sidebar dan konten utama -->
    <SidebarProvider class="group/sidebar-wrapper">
      <!-- AppSidebar (yang berisi komponen Sidebar shadcn) -->
      <AppSidebar />
      
      <!-- SidebarInset akan menjadi area konten utama yang "inset" -->
      <!-- Tambahkan flex-1 untuk mengambil sisa ruang horizontal. -->
      <SidebarInset class="flex-1 flex flex-col bg-background rounded-xl shadow border border-border">
        <header class="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger class="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink as-child>
                  <NuxtLink to="/dashboard">Dashboard</NuxtLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{{ route.meta.title || route.name || 'Page' }}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <component :is="separator" orientation="vertical" class="mr-2 h-4" />
        </header>
        <!-- Konten halaman akan dirender di sini -->
        <!-- ✅ PERBAIKAN: Tambahkan overflow-y-auto agar konten di dalam slot bisa discroll -->
        <div class="flex-1 p-6 overflow-y-auto">
          <slot />
        </div>
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>
