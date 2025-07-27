<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { useRouter } from 'vue-router'
import RTRWBreakdownChart from '@/components/RTRWBreakdownChart.vue'
import PieChart from '~/components/PieChart.vue'
import { useNuxtApp } from '#app'
import SmartCriteriaWeights from '@/components/SmartCriteriaWeights.vue'
import type { Warga } from '@/types/warga' // Pastikan ini diimpor

const { $firebase } = useNuxtApp()
const db = $firebase.db
const router = useRouter()

const totalWarga = ref(0)
const layak = ref(0)
const pertimbangan = ref(0)
const tidakLayak = ref(0)
const allWarga = ref<Warga[]>([]) // Menggunakan tipe Warga[]
const isLoading = ref(true)

// Warna yang konsisten dengan tema untuk legend
const legendColors = [
  '#10B981', // Green untuk Layak
  '#F59E0B', // Yellow untuk Pertimbangan
  '#EF4444'  // Red untuk Tidak Layak
]

const totalDataDonut = computed(() => {
  return layak.value + pertimbangan.value + tidakLayak.value
})

const legendDataDonut = computed(() => {
  const data = [layak.value, pertimbangan.value, tidakLayak.value]
  const labels = ['Layak', 'Pertimbangan', 'Tidak Layak']
  return labels.map((label, index) => ({
    label,
    value: data[index],
    color: legendColors[index],
    percentage: totalDataDonut.value > 0
      ? Math.round((data[index] / totalDataDonut.value) * 100)
      : 0
  }))
})

const layakPercentage = computed(() => {
  if (totalDataDonut.value === 0) return 0
  return Math.round((layak.value / totalDataDonut.value) * 100)
})

const effectiveness = computed(() => {
  if (totalDataDonut.value === 0) return 'N/A'
  const score = ((layak.value * 1) + (pertimbangan.value * 0.5)) / totalDataDonut.value
  if (score >= 0.8) return 'Tinggi'
  if (score >= 0.6) return 'Sedang'
  return 'Rendah'
})

const fetchDashboardData = async () => {
  try {
    isLoading.value = true
    const { collection, getDocs } = await import('firebase/firestore')
    const snapshot = await getDocs(collection(db, 'data_warga'))
    const data: Warga[] = snapshot.docs.map((doc) => ({ // Menggunakan tipe Warga
      id: doc.id,
      ...doc.data()
    } as Warga)) // Cast ke tipe Warga
    
    allWarga.value = data
    totalWarga.value = data.length
    layak.value = data.filter(w => (w.skorKelayakan ?? 0) >= 0.7).length
    pertimbangan.value = data.filter(w => (w.skorKelayakan ?? 0) >= 0.4 && (w.skorKelayakan ?? 0) < 0.7).length
    tidakLayak.value = data.filter(w => (w.skorKelayakan ?? 0) < 0.4).length
  } catch (err) {
    console.error('Gagal mengambil data dashboard:', err)
  } finally {
    isLoading.value = false
  }
}

// ✅ BARU: Computed property untuk Top 5 Skor Kelayakan
const top5SkorKelayakan = computed(() => {
  return [...allWarga.value]
    .filter(w => typeof w.skorKelayakan === 'number' && w.skorKelayakan !== null)
    .sort((a, b) => (b.skorKelayakan ?? 0) - (a.skorKelayakan ?? 0))
    .slice(0, 5);
});

const getScoreClass = (score?: number) => {
  if (score === undefined) return 'bg-gray-100 text-gray-800';
  if (score >= 0.7) return 'bg-green-100 text-green-800';
  if (score >= 0.4) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

definePageMeta({
  title: 'Dashboard',
  middleware: ['auth'],
})

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
    </div>
    
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <span class="ml-2">Memuat data...</span>
    </div>
    
    <div v-else class="space-y-6">
      <!-- Ringkasan Stat -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Total Warga</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ totalWarga }}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Layak</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-green-600">{{ layak }}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Pertimbangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-yellow-600">{{ pertimbangan }}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Tidak Layak</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-red-600">{{ tidakLayak }}</div>
          </CardContent>
        </Card>
      </div>

      <!-- Grid Bawah: Donut Chart & RT/RW Breakdown & Top 5 Skor -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Kiri: Donut Chart, Legend, Summary Cards -->
        <div class="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Kelayakan</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="h-64">
                <PieChart
                  v-if="totalDataDonut > 0"
                  :labels="['Layak', 'Pertimbangan', 'Tidak Layak']"
                  :data="[layak, pertimbangan, tidakLayak]"
                />
                <div v-else class="flex items-center justify-center h-full text-gray-500">
                  Tidak ada data
                </div>
              </div>

              <!-- Custom Legend -->
              <div class="mt-6 space-y-3">
                <div v-for="(item, index) in legendDataDonut" :key="index"
                     class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-4 h-4 rounded-full"
                      :style="{ backgroundColor: item.color }"
                    ></div>
                    <span class="font-medium text-gray-700">{{ item.label }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-lg font-bold" :style="{ color: item.color }">
                      {{ item.value }}
                    </span>
                    <span class="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                      {{ item.percentage }}%
                    </span>
                  </div>
                </div>
              </div>

              <!-- Summary Stats -->
              <div class="mt-4 grid grid-cols-2 gap-3">
                <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-lg text-center">
                  <div class="text-sm opacity-90">Tingkat Kelayakan</div>
                  <div class="text-xl font-bold">{{ layakPercentage }}%</div>
                </div>
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg text-center">
                  <div class="text-sm opacity-90">Efektivitas</div>
                  <div class="text-xl font-bold">{{ effectiveness }}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <SmartCriteriaWeights />
        </div>
        
        <!-- Kanan: RT/RW Breakdown Chart & Top 5 Skor Kelayakan -->
        <div class="lg:col-span-2 space-y-6">
          <RTRWBreakdownChart
            :allWarga="allWarga"
            @refresh-dashboard="fetchDashboardData"
          />

          <!-- ✅ BARU: Top 5 Skor Kelayakan -->
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Skor Kelayakan</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>NIK KK</TableHead>
                    <TableHead class="text-right">Skor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="top5SkorKelayakan.length === 0">
                    <TableCell colspan="3" class="text-center text-muted-foreground">
                      Tidak ada data skor kelayakan.
                    </TableCell>
                  </TableRow>
                  <TableRow v-for="warga in top5SkorKelayakan" :key="warga.id">
                    <TableCell class="font-medium">{{ warga.nama }}</TableCell>
                    <TableCell>{{ warga.nik_kk }}</TableCell>
                    <TableCell class="text-right">
                      <span :class="getScoreClass(warga.skorKelayakan)" class="px-2 py-1 rounded-md text-xs font-medium">
                        {{ warga.skorKelayakan?.toFixed(3) }}
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
