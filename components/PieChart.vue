<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  labels: string[]
  data: number[]
}>()

const chartData = {
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: [
        '#10B981', // Green untuk Layak
        '#F59E0B', // Yellow untuk Pertimbangan
        '#EF4444'  // Red untuk Tidak Layak
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false // Kita akan membuat legend custom
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const label = context.label || '';
          const value = context.parsed;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  },
  cutout: '60%', // Membuat donut chart
}
</script>

<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>
