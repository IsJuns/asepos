<script setup lang="ts">
import { 
Home, 
Users, 
FileText, 
BarChart3, 
Settings, 
LogOut, 
Building2, // Tetap impor jika masih digunakan di tempat lain, atau hapus jika tidak
ChevronDown,
MapPin
} from "lucide-vue-next"
import {
Sidebar,
SidebarContent,
SidebarGroup,
SidebarGroupContent,
SidebarGroupLabel,
SidebarHeader,
SidebarMenu,
SidebarMenuButton,
SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ✅ PERBAIKAN: Data kelurahan disesuaikan dengan Babakan Asih
const kelurahanData = {
  name: "Kelurahan Babakan Asih",
  district: "Kecamatan Bojongloa Kaler", // Contoh kecamatan untuk Babakan Asih
  city: "Bandung" // Contoh kota untuk Babakan Asih
}

// Menu items utama
const mainMenuItems = [
{
  title: "Dashboard",
  url: "/dashboard",
  icon: Home,
  description: "Halaman utama sistem"
},
{
  title: "Input Data Warga",
  url: "/inputData",
  icon: Users,
  description: "Form input data warga"
},
{
  title: "Output Data",
  url: "/outputData",
  icon: FileText,
  description: "Lihat dan kelola data warga"
},
]

// Menu API Reference
const apiItems = [
{
  title: "Components",
  url: "#",
  icon: BarChart3,
  description: "Komponen sistem"
},
]

// Menu Account
const accountItems = [
{
  title: "Settings",
  url: "#",
  icon: Settings,
  description: "Pengaturan sistem"
},
{
  title: "Logout",
  url: "/logout",
  icon: LogOut,
  description: "Keluar dari sistem"
},
]
</script>

<template>
<Sidebar variant="inset" collapsible="none">
  <SidebarHeader>
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <!-- ✅ PERBAIKAN: Ganti ikon Building2 dengan logo gambar -->
              <img src="/assets/image/basih.png" alt="Kelurahan Babakan Asih Logo" class="size-8 object-contain" />
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ kelurahanData.name }}</span>
                <span class="truncate text-xs">{{ kelurahanData.district }}</span>
              </div>
              <ChevronDown class="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="bottom"
            align="start"
            :sideOffset="4"
          >
            <DropdownMenuItem class="gap-2 p-2">
              <!-- ✅ PERBAIKAN: Ganti ikon Building2 dengan logo gambar di dropdown -->
              <img src="/assets/image/basih.png" alt="Kelurahan Babakan Asih Logo" class="size-6 object-contain" />
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ kelurahanData.name }}</span>
                <span class="truncate text-xs text-muted-foreground">{{ kelurahanData.district }}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem class="gap-2 p-2">
              <div class="flex size-6 items-center justify-center rounded-sm border">
                <MapPin class="size-4 shrink-0" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ kelurahanData.city }}</span>
                <span class="truncate text-xs text-muted-foreground">Kota</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarHeader>

  <SidebarContent>
    <!-- Platform Section -->
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in mainMenuItems" :key="item.title">
            <SidebarMenuButton as-child :tooltip="item.description">
              <NuxtLink :to="item.url" class="flex items-center gap-2">
                <component :is="item.icon" class="size-4" />
                <span>{{ item.title }}</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>

    <!-- API Reference Section -->
    <SidebarGroup>
      <SidebarGroupLabel>API Reference</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in apiItems" :key="item.title">
            <SidebarMenuButton as-child :tooltip="item.description">
              <a :href="item.url" class="flex items-center gap-2">
                <component :is="item.icon" class="size-4" />
                <span>{{ item.title }}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>

    <!-- Account Section -->
    <SidebarGroup>
      <SidebarGroupLabel>Account</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in accountItems" :key="item.title">
            <SidebarMenuButton as-child :tooltip="item.description">
              <NuxtLink :to="item.url" class="flex items-center gap-2">
                <component :is="item.icon" class="size-4" />
                <span>{{ item.title }}</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
</Sidebar>
</template>
