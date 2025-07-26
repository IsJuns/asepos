<script setup lang="ts">
import { GalleryVerticalEnd } from 'lucide-vue-next'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  type SidebarProps,
  SidebarRail,
} from '@/components/ui/sidebar'

const props = defineProps<SidebarProps>()

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      items: [
        {
          title: "Input Data Warga",
          url: "/inputData"
        },
        {
          title: "Output Data",
          url: "/outputData"
        }

      ]
    },
    
    {
      title: 'API Reference',
      url: '#',
      items: [
        {
          title: 'Components',
          url: '#',
        },
        // {
        //   title: 'File Conventions',
        //   url: '#',
        // },
        // {
        //   title: 'Functions',
        //   url: '#',
        // },
        // {
        //   title: 'next.config.js Options',
        //   url: '#',
        // },
        // {
        //   title: 'CLI',
        //   url: '#',
        // },
        // {
        //   title: 'Edge Runtime',
        //   url: '#',
        // },
      ],
    },
    {
      title: 'Account',
      url: '#',
      items: [
        {
          title: 'Settings',
          url: '#',
        },  
        {
          title: 'Logout',
          url: '/logout',
        },
      ],
    },
  ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <a href="#">
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd class="size-4" />
              </div>
              <div class="flex flex-col gap-0.5 leading-none">
                <span class="font-semibold">Decision Support System</span>
                <span class="">DSS</span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in data.navMain" :key="item.title">
            <SidebarMenuButton as-child>
              <NuxtLink :to="item.url" class="font-medium">
                {{ item.title }}
              </NuxtLink>
            </SidebarMenuButton>
            <SidebarMenuSub v-if="item.items.length">
              <SidebarMenuSubItem v-for="childItem in item.items" :key="childItem.title">
                <SidebarMenuSubButton as-child >
                  <NuxtLink :to="childItem.url">{{ childItem.title }}</NuxtLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
</template>
