<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  labels: string[]
  data: number[]
}>()

onMounted(() => {
  console.log('BarChart received labels:', props.labels);
  console.log('BarChart received data:', props.data);
});

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Skor Rata-Rata',
      data: props.data,
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: '#3b82f6',
      borderWidth: 1
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
  <Bar :data="chartData" :options="options" />
</template>
