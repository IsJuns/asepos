<template>
  <div class="space-y-6">
    <!-- Header dengan Filter -->
    <div class="flex justify-between items-center">
      <h3 class="text-xl font-semibold">Breakdown Detail per RT/RW</h3>
      <div class="flex gap-3">
        <select 
          v-model="selectedRW" 
          @change="updateData"
          class="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua RW</option>
          <option v-for="rw in availableRW" :key="rw" :value="rw">RW {{ rw }}</option>
        </select>
        <select 
          v-model="viewMode" 
          class="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="chart">Chart View</option>
          <option value="table">Table View</option>
          <option value="both">Both</option>
        </select>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border rounded-lg p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 font-medium">Total RT</p>
            <p class="text-2xl font-bold text-blue-600">{{ totalRT }}</p>
          </div>
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white border rounded-lg p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 font-medium">Rata-rata Skor</p>
            <p class="text-2xl font-bold text-green-600">{{ averageScore.toFixed(3) }}</p>
          </div>
          <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white border rounded-lg p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 font-medium">RT Terbaik</p>
            <p class="text-lg font-bold text-yellow-600">{{ bestRT }}</p>
            <p class="text-xs text-gray-500">{{ bestScore.toFixed(3) }}</p>
          </div>
          <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white border rounded-lg p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 font-medium">Perlu Perhatian</p>
            <p class="text-2xl font-bold text-red-600">{{ needsAttention }}</p>
          </div>
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Section -->
    <div v-if="viewMode === 'chart' || viewMode === 'both'" class="bg-white border rounded-lg p-6 shadow-sm">
      <div class="flex justify-between items-center mb-4">
        <h4 class="text-lg font-semibold">Tren Skor per RT/RW</h4>
        <div class="flex gap-2">
          <button 
            @click="chartType = 'line'" 
            :class="[
              'px-3 py-1 text-sm rounded-md transition-colors',
              chartType === 'line' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            Line
          </button>
          <button 
            @click="chartType = 'bar'" 
            :class="[
              'px-3 py-1 text-sm rounded-md transition-colors',
              chartType === 'bar' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            Bar
          </button>
        </div>
      </div>
      <div class="h-80">
        <LineChart 
          v-if="chartType === 'line'"
          :labels="chartLabels" 
          :data="chartData" 
        />
        <BarChart 
          v-else
          :labels="chartLabels" 
          :data="chartData" 
        />
      </div>
    </div>

    <!-- Table Section -->
    <div v-if="viewMode === 'table' || viewMode === 'both'" class="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h4 class="text-lg font-semibold">Detail Data RT/RW</h4>
          <div class="flex gap-2">
            <button 
              @click="exportToExcel" 
              class="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Export Excel
            </button>
            <button 
              @click="refreshData" 
              class="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RT/RW</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Warga</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skor Rata-rata</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Layak</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pertimbangan</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tidak Layak</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in sortedRTRWData" :key="`${item.rt}-${item.rw}`" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                ]">
                  {{ index + 1 }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                RT {{ item.rt }}/RW {{ item.rw }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.totalWarga }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                {{ item.averageScore.toFixed(3) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{{ item.layak }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-600">{{ item.pertimbangan }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{{ item.tidakLayak }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(item.averageScore)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ getStatusText(item.averageScore) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Comparison Section -->
    <div class="bg-white border rounded-lg p-6 shadow-sm">
      <h4 class="text-lg font-semibold mb-4">Perbandingan Antar RW</h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="rw in rwComparison" :key="rw.rw" class="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <h5 class="font-medium mb-3 text-center">RW {{ rw.rw }}</h5>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Total RT:</span>
              <span class="font-medium">{{ rw.totalRT }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Rata-rata Skor:</span>
              <span class="font-medium">{{ rw.averageScore.toFixed(3) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">RT Terbanyak:</span>
              <span class="font-medium">RT {{ rw.bestRT }}</span>
            </div>
            <div class="mt-3 pt-2 border-t">
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  :style="{ width: `${(rw.averageScore * 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits } from 'vue'
import LineChart from '@/components/LineChart.vue'
import BarChart from './BarChart.vue'
import * as XLSX from 'xlsx' // Import library XLSX

// Props - menggunakan data dari parent dashboard
const props = defineProps<{
  allWarga: any[]
}>()

// Define emits untuk komunikasi dengan parent
const emit = defineEmits(['refresh-dashboard'])

// Reactive state
const selectedRW = ref('')
const viewMode = ref<'chart' | 'table' | 'both'>('both')
const chartType = ref<'line' | 'bar'>('line')

// Computed data untuk breakdown RT/RW
const rtRwBreakdown = computed(() => {
  const breakdown: Record<string, {
    rt: number
    rw: number
    warga: any[]
    totalWarga: number
    averageScore: number
    layak: number
    pertimbangan: number
    tidakLayak: number
  }> = {}

  props.allWarga.forEach(warga => {
    if (!warga.rt || !warga.rw || typeof warga.skorKelayakan !== 'number') return
    
    const key = `${warga.rt}-${warga.rw}`
    
    if (!breakdown[key]) {
      breakdown[key] = {
        rt: warga.rt,
        rw: warga.rw,
        warga: [],
        totalWarga: 0,
        averageScore: 0,
        layak: 0,
        pertimbangan: 0,
        tidakLayak: 0
      }
    }
    
    breakdown[key].warga.push(warga)
    breakdown[key].totalWarga++
    
    // Kategorisasi sesuai dengan logika dashboard Anda
    if (warga.skorKelayakan >= 0.7) {
      breakdown[key].layak++
    } else if (warga.skorKelayakan >= 0.4) {
      breakdown[key].pertimbangan++
    } else {
      breakdown[key].tidakLayak++
    }
  })

  // Hitung rata-rata skor untuk setiap RT/RW
  Object.values(breakdown).forEach(item => {
    const totalScore = item.warga.reduce((sum, w) => sum + w.skorKelayakan, 0)
    item.averageScore = totalScore / item.warga.length
  })

  return Object.values(breakdown)
})

// Filter berdasarkan RW yang dipilih
const filteredRTRWData = computed(() => {
  if (!selectedRW.value) return rtRwBreakdown.value
  return rtRwBreakdown.value.filter(item => item.rw.toString() === selectedRW.value)
})

// Data yang sudah diurutkan berdasarkan skor
const sortedRTRWData = computed(() => {
  return [...filteredRTRWData.value].sort((a, b) => b.averageScore - a.averageScore)
})

// Available RW options
const availableRW = computed(() => {
  const rwSet = new Set(rtRwBreakdown.value.map(item => item.rw.toString()))
  return Array.from(rwSet).sort()
})

// Chart data
const chartLabels = computed(() => {
  return sortedRTRWData.value.map(item => `RT ${item.rt}/RW ${item.rw}`)
})

const chartData = computed(() => {
  return sortedRTRWData.value.map(item => item.averageScore)
})

// Summary statistics
const totalRT = computed(() => filteredRTRWData.value.length)

const averageScore = computed(() => {
  if (filteredRTRWData.value.length === 0) return 0
  const total = filteredRTRWData.value.reduce((sum, item) => sum + item.averageScore, 0)
  return total / filteredRTRWData.value.length
})

const bestRT = computed(() => {
  if (sortedRTRWData.value.length === 0) return '-'
  const best = sortedRTRWData.value[0]
  return `RT ${best.rt}/RW ${best.rw}`
})

const bestScore = computed(() => {
  if (sortedRTRWData.value.length === 0) return 0
  return sortedRTRWData.value[0].averageScore
})

const needsAttention = computed(() => {
  return filteredRTRWData.value.filter(item => item.averageScore < 0.4).length
})

// RW Comparison
const rwComparison = computed(() => {
  const rwGroups: Record<number, any[]> = {}
  
  rtRwBreakdown.value.forEach(item => {
    if (!rwGroups[item.rw]) rwGroups[item.rw] = []
    rwGroups[item.rw].push(item)
  })

  return Object.entries(rwGroups).map(([rw, items]) => {
    const totalScore = items.reduce((sum, item) => sum + item.averageScore, 0)
    const bestItem = items.reduce((best, current) => 
      current.averageScore > best.averageScore ? current : best
    )
    
    return {
      rw: parseInt(rw),
      totalRT: items.length,
      averageScore: totalScore / items.length,
      bestRT: bestItem.rt
    }
  }).sort((a, b) => b.averageScore - a.averageScore)
})

// Helper functions
const getStatusClass = (score: number) => {
  if (score >= 0.7) return 'bg-green-100 text-green-800'
  if (score >= 0.4) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const getStatusText = (score: number) => {
  if (score >= 0.7) return 'Layak'
  if (score >= 0.4) return 'Pertimbangan'
  return 'Tidak Layak'
}

const updateData = () => {
  // Data akan otomatis update karena computed properties
}

const exportToExcel = () => {
  const dataToExport = sortedRTRWData.value.map(item => ({
    'Rank': sortedRTRWData.value.indexOf(item) + 1,
    'RT/RW': `RT ${item.rt}/RW ${item.rw}`,
    'Total Warga': item.totalWarga,
    'Skor Rata-rata': item.averageScore.toFixed(3),
    'Layak': item.layak,
    'Pertimbangan': item.pertimbangan,
    'Tidak Layak': item.tidakLayak,
    'Status': getStatusText(item.averageScore)
  }))

  const ws = XLSX.utils.json_to_sheet(dataToExport)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data RT-RW Breakdown')
  XLSX.writeFile(wb, 'data_rt_rw_breakdown.xlsx')
  console.log('Exporting to Excel...')
}

const refreshData = () => {
  console.log('Refreshing data...')
  emit('refresh-dashboard') // Emit event ke parent untuk refresh data
}
</script>
