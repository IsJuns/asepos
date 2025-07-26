<template>
  <div class="bg-white border rounded-lg p-6 shadow-sm">
    <h3 class="text-lg font-semibold mb-4">Bobot Kriteria SMART</h3>
    <p class="text-sm text-gray-600 mb-4">
      Berikut adalah bobot relatif dari setiap kriteria yang digunakan dalam perhitungan skor kelayakan, sesuai dengan metode SMART.
    </p>
    <div class="space-y-4">
      <div v-for="criterion in criteria" :key="criterion.name" class="flex flex-col">
        <div class="flex justify-between items-center mb-1">
          <span class="text-gray-700 font-medium">{{ criterion.name }}</span>
          <span class="text-blue-600 font-bold">{{ criterion.weight }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            class="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
            :style="{ width: `${criterion.weight}%` }"
          ></div>
        </div>
      </div>
    </div>
    <div class="mt-6 text-sm text-gray-500 border-t pt-4">
      Total Bobot: <span class="font-bold">{{ totalWeight }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const criteria = [
  { name: 'Penghasilan', weight: 30 },
  { name: 'Jumlah Tanggungan', weight: 25 },
  { name: 'Kondisi Tempat Tinggal', weight: 20 },
  { name: 'Status Pekerjaan', weight: 15 },
]

const totalWeight = computed(() => {
  return criteria.reduce((sum, c) => sum + c.weight, 0)
})
</script>
