<script setup lang="ts">
import { ref, onMounted, computed } from 'vue' // Hapus watch
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { useRouter } from 'vue-router'
import RTRWBreakdownChart from '@/components/RTRWBreakdownChart.vue'
import PieChart from '~/components/PieChart.vue'
import { definePageMeta } from '#imports' // Hapus useNuxtApp
import type { Warga } from '@/types/warga'
import { Plus, Download, Upload, BarChart } from 'lucide-vue-next'
import StatusPekerjaanChart from '~/components/StatusPekerjaanChart.vue'
import KondisiTempatTinggalChart from '~/components/KondisiTempatTinggalChart.vue'
import { useDashboardData } from '@/composables/useDashboardData'
import { collection, addDoc } from 'firebase/firestore' // Import for handleFileImport
import { useNuxtApp } from '#app' // Declare useNuxtApp

const router = useRouter()
const { $firebase } = useNuxtApp() // Get db instance here
const db = $firebase.db

const {
  totalWarga,
  layak,
  pertimbangan,
  tidakLayak,
  allWarga,
  isLoading,
  recentWarga,
  fetchDashboardData // Fungsi fetch sekarang dari composable
} = useDashboardData()

const importFileInput = ref<HTMLInputElement | null>(null)

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

const getScoreClass = (score?: number) => {
  if (score === undefined) return 'bg-gray-100 text-gray-800';
  if (score >= 0.7) return 'bg-green-100 text-green-800';
  if (score >= 0.4) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

const handleTambahData = () => {
  console.log('Tambah Data clicked!');
  router.push('/inputData'); // Example: navigate to input data page
}

const handleEksporData = () => {
  console.log('Ekspor Data clicked!');
  const dataStr = JSON.stringify(allWarga.value, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'data_warga.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  alert('Data warga berhasil diekspor sebagai data_warga.json!');
}

const handleImporData = () => {
  console.log('Impor Data clicked!');
  importFileInput.value?.click(); // Trigger the hidden file input
}

const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData: Warga[] = JSON.parse(e.target?.result as string);
        console.log('Data berhasil diimpor:', importedData);

        for (const warga of importedData) {
          const { id, ...dataToSave } = warga;
          await addDoc(collection(db, 'data_warga'), dataToSave);
        }
        alert('Data berhasil diimpor dan disimpan ke database!');
        fetchDashboardData(); // Refresh dashboard data after import
      } catch (error) {
        console.error('Gagal memproses file impor:', error);
        alert('Gagal memproses file impor. Pastikan formatnya benar.');
      }
    };
    reader.readAsText(file);
  }
}

const handleAnalisis = () => {
  console.log('Analisis clicked!');
  // router.push('/analysis'); // Example: navigate to an analysis page
}

definePageMeta({
  title: 'Dashboard',
  middleware: ['auth'],
})

onMounted(() => {
  fetchDashboardData() // Panggil fungsi fetch dari composable
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
      <!-- Ringkasan Stat - Disesuaikan untuk 3 kartu -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card class="bg-green-50 border-green-200 text-green-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Layak</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ layak }}</div>
          </CardContent>
        </Card>
        <Card class="bg-yellow-50 border-yellow-200 text-yellow-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Pertimbangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ pertimbangan }}</div>
          </CardContent>
        </Card>
        <Card class="bg-red-50 border-red-200 text-red-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Tidak Layak</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ tidakLayak }}</div>
          </CardContent>
        </Card>
      </div>

      <!-- Grid Bawah: Donut Chart & RT/RW Breakdown & Recent Data Entries & New Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Kiri: Donut Chart, Legend, Summary Cards, Recent Data Entries -->
        <div class="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Kelayakan</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="relative h-64">
                <PieChart
                  v-if="totalDataDonut > 0"
                  :labels="['Layak', 'Pertimbangan', 'Tidak Layak']"
                  :data="[layak, pertimbangan, tidakLayak]"
                />
                <div v-else class="flex items-center justify-center h-full text-gray-500">
                  Tidak ada data
                </div>
                <!-- Total Warga di tengah donut chart -->
                <div v-if="totalWarga > 0" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span class="text-4xl font-bold text-gray-900">{{ totalWarga }}</span>
                  <span class="text-sm text-gray-500">Total Warga</span>
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

          <!-- Recent Data Entries -->
          <Card>
            <CardHeader>
              <CardTitle>Entri Data Terbaru</CardTitle>
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
                  <TableRow v-if="recentWarga.length === 0">
                    <TableCell colspan="3" class="text-center text-muted-foreground">
                      Tidak ada entri data terbaru.
                    </TableCell>
                  </TableRow>
                  <TableRow v-for="warga in recentWarga" :key="warga.id">
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

        <!-- Kanan: RT/RW Breakdown Chart & New Charts & Quick Actions -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Quick Actions -->
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button @click="handleTambahData" class="flex flex-col h-auto py-4 items-center justify-center text-center bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
                <Plus class="h-5 w-5 mb-1" />
                <span class="text-xs">Tambah Data</span>
              </Button>
              <Button @click="handleEksporData" class="flex flex-col h-auto py-4 items-center justify-center text-center bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200">
                <Download class="h-5 w-5 mb-1" />
                <span class="text-xs">Ekspor Data</span>
              </Button>
              <Button @click="handleImporData" class="flex flex-col h-auto py-4 items-center justify-center text-center bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200">
                <Upload class="h-5 w-5 mb-1" />
                <span class="text-xs">Impor Data</span>
              </Button>
              <Button @click="handleAnalisis" class="flex flex-col h-auto py-4 items-center justify-center text-center bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md hover:shadow-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200">
                <BarChart class="h-5 w-5 mb-1" />
                <span class="text-xs">Analisis</span>
              </Button>
              <!-- Hidden file input for import -->
              <input type="file" ref="importFileInput" @change="handleFileImport" accept=".json" class="hidden" />
            </CardContent>
          </Card>

          <RTRWBreakdownChart
            :allWarga="allWarga"
            @refresh-dashboard="fetchDashboardData"
          />
          <StatusPekerjaanChart :allWarga="allWarga" />
          <KondisiTempatTinggalChart :allWarga="allWarga" />
        </div>
      </div>
    </div>
  </div>
</template>
