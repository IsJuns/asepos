<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler } from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler)

const props = defineProps<{
  labels: string[]
  data: number[]
}>()

onMounted(() => {
  console.log('LineChart received labels:', props.labels);
  console.log('LineChart received data:', props.data);
});

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Skor Rata-Rata',
      data: props.data,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
      tension: 0.4
    }
  ]
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      max: 1,
      title: {
        display: true,
        text: 'Rata-rata Skor Kelayakan'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Kategori'
      }
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const
    },
    tooltip: {
      enabled: true
    }
  }
}
</script>
<template>
  <Line :data="chartData" :options="options" />
</template>
