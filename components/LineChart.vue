<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler // ✅ tambahkan plugin ini
} from 'chart.js'

// ✅ REGISTER semua plugin, termasuk Filler
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler // ✅ ini penting agar fill: true bekerja
)

// Props dari parent
const props = defineProps<{
  labels: string[]
  data: number[]
}>()

// ✅ Reactive chart data
const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Skor Rata-Rata',
      data: props.data,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true, // ✅ Aktifkan fill area di bawah garis
      tension: 0.4
    }
  ]
}))

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const
    },
    title: {
      display: true,
      text: 'Rata-Rata Skor Kelayakan'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 1
    }
  }
}
</script>

<template>
  <Line :data="chartData" :options="options" />
</template>
