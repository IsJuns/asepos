<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { useRouter } from 'vue-router'
import LineChart from '@/components/LineChart.vue'
import RTRWBreakdownChart from '@/components/RTRWBreakdownChart.vue'
import PieChart from '~/components/PieChart.vue'
import { useNuxtApp } from '#app'
import SmartCriteriaWeights from '@/components/SmartCriteriaWeights.vue'

// Dapatkan instance Firebase yang disediakan oleh plugin
const { $firebase } = useNuxtApp()
const db = $firebase.db // Akses db dari $firebase

const router = useRouter()
const chartMode = ref<'RT' | 'RW'>('RT')
const averageLabels = ref<string[]>([])
const averageData = ref<number[]>([])
const totalWarga = ref(0)
const layak = ref(0)
const pertimbangan = ref(0)
const tidakLayak = ref(0)
const allWarga = ref<any[]>([])

// Terapkan middleware 'auth' ke halaman ini
definePageMeta({
  middleware: ['auth'],
})

// Warna yang konsisten dengan tema untuk legend
const legendColors = [
  '#10B981', // Green untuk Layak
  '#F59E0B', // Yellow untuk Pertimbangan
  '#EF4444'  // Red untuk Tidak Layak
]

// Computed properties untuk legend dan summary cards
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

// Fetch data dari Firebase
const fetchDashboardData = async () => {
  try {
    // Impor fungsi Firestore secara dinamis di sini
    const { collection, getDocs } = await import('firebase/firestore');
    // Gunakan fungsi collection dan getDocs dengan instance db
    const snapshot = await getDocs(collection(db, 'data_warga'))
    const data = snapshot.docs.map((doc: { id: any; data: () => any }) => ({
      id: doc.id,
      ...doc.data()
    })) as {
      id: string
      nama: string
      nik: string
      penghasilan: number
      jumlah_tanggungan: number
      kondisi_tempat_tinggal: string
      status_pekerjaan: string
      skorKelayakan?: number
      rt?: number
      rw?: number
    }[]
    allWarga.value = data
    totalWarga.value = data.length
    layak.value = data.filter(w => (w.skorKelayakan ?? 0) >= 0.7).length
    pertimbangan.value = data.filter(w => (w.skorKelayakan ?? 0) >= 0.4 && (w.skorKelayakan ?? 0) < 0.7).length
    tidakLayak.value = data.filter(w => (w.skorKelayakan ?? 0) < 0.4).length
    hitungRataRataChart(chartMode.value)
  } catch (err) {
    console.error('Gagal mengambil data dashboard:', err)
  }
}

// Hitung rata-rata skor berdasarkan RT atau RW
const hitungRataRataChart = (mode: 'RT' | 'RW') => {
  const grup: Record<number, number[]> = {}
  for (const w of allWarga.value) {
    if (typeof w.skorKelayakan !== 'number') continue
    const key = parseInt(mode === 'RT' ? (w.rt as any) : (w.rw as any))
    if (isNaN(key)) continue
    if (!grup[key]) grup[key] = []
    grup[key].push(w.skorKelayakan)
  }

  averageLabels.value = Object.keys(grup).map(k => `${mode} ${k}`)
  averageData.value = Object.values(grup).map(list => {
    const total = list.reduce((a, b) => a + b, 0)
    return parseFloat((total / list.length).toFixed(3))
  })
}

// Update chart jika mode berubah
watch(chartMode, (mode) => {
  hitungRataRataChart(mode)
})

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <Card class="p-6">
    <CardHeader>
      <CardTitle class="text-xl">Dashboard</CardTitle>
    </CardHeader>
    <CardContent class="space-y-6">
      <!-- Ringkasan Stat -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card class="text-center p-4">
          <p class="text-sm text-muted-foreground">Total Warga</p>
          <h3 class="text-2xl font-bold">{{ totalWarga }}</h3>
        </Card>
        <Card class="text-center p-4">
          <p class="text-sm text-muted-foreground">Layak</p>
          <h3 class="text-2xl font-bold text-green-500">{{ layak }}</h3>
        </Card>
        <Card class="text-center p-4">
          <p class="text-sm text-muted-foreground">Pertimbangan</p>
          <h3 class="text-2xl font-bold text-yellow-500">{{ pertimbangan }}</h3>
        </Card>
        <Card class="text-center p-4">
          <p class="text-sm text-muted-foreground">Tidak Layak</p>
          <h3 class="text-2xl font-bold text-red-500">{{ tidakLayak }}</h3>
        </Card>
      </div>
      <!-- Grid Bawah: Donut Chart & RT/RW Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Kiri: Donut Chart, Legend, Summary Cards & SMART Criteria Weights -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white border rounded-lg p-6 shadow-sm">
            <h3 class="text-lg font-semibold mb-4">Distribusi Kelayakan</h3>
            <div class="h-64"> <!-- Tinggi yang lebih pas untuk chart saja -->
              <PieChart
                v-if="[layak, pertimbangan, tidakLayak].every(v => typeof v === 'number')"
                :labels="['Layak', 'Pertimbangan', 'Tidak Layak']"
                :data="[layak, pertimbangan, tidakLayak]"
              />
            </div>

            <!-- Custom Legend dengan Badge (dipindahkan ke sini) -->
            <div class="mt-6 space-y-3">
              <div v-for="(item, index) in legendDataDonut" :key="index"
                   class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div
                  class="w-4 h-4 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: item.color }"
                ></div>
                <span class="font-medium text-gray-700">{{ item.label }}</span>
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

            <!-- Summary Stats (dipindahkan ke sini) -->
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
          </div>

          <!-- ✅ SMART Criteria Weights (tetap di sini, sekarang tidak akan menimpa) -->
          <SmartCriteriaWeights />
        </div>
        <!-- Kanan: RT/RW Breakdown Chart - 2 kolom -->
        <div class="lg:col-span-2">
          <RTRWBreakdownChart
            :allWarga="allWarga"
            @refresh-dashboard="fetchDashboardData"
          />
        </div>
      </div>
    </CardContent>
  </Card>
</template>
