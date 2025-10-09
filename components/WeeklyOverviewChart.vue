<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Warga } from '@/types/warga'
import LineChart from '~/components/LineChart.vue' // Menggunakan LineChart untuk tren mingguan

const props = defineProps<{
  allWarga: Warga[]
}>()

const chartLabels = ref<string[]>([])
const chartData = ref<number[]>([])

const processChartData = () => {
  if (!props.allWarga || props.allWarga.length === 0) {
    chartLabels.value = [];
    chartData.value = [];
    console.log('Tidak ada data warga untuk Weekly Overview chart.');
    return;
  }

  const weeklyCounts: Record<string, number> = {};

  props.allWarga.forEach(warga => {
    if (warga.timestamp) {
      const date = new Date(warga.timestamp);
      // Dapatkan tanggal awal minggu (misal: Senin)
      const day = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      const startOfWeek = new Date(date.setDate(diff));
      startOfWeek.setHours(0, 0, 0, 0); // Set to start of the day

      const weekKey = `${startOfWeek.getFullYear()}-${startOfWeek.getMonth() + 1}-${startOfWeek.getDate()}`;
      weeklyCounts[weekKey] = (weeklyCounts[weekKey] || 0) + 1;
    }
  });

  // Urutkan berdasarkan tanggal minggu
  const sortedKeys = Object.keys(weeklyCounts).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
  });

  chartLabels.value = sortedKeys.map(key => {
    const date = new Date(key);
    return `Minggu ${date.getDate()}/${date.getMonth() + 1}`; // Format: Minggu DD/MM
  });
  chartData.value = sortedKeys.map(key => weeklyCounts[key]);

  console.log('Weekly Overview Chart Labels:', chartLabels.value);
  console.log('Weekly Overview Chart Data:', chartData.value);
}

watch(() => props.allWarga, () => {
  processChartData();
}, { deep: true, immediate: true });
</script>

<template>
  <Card class="p-6">
    <CardHeader>
      <CardTitle class="text-lg font-semibold">Jumlah Entri Data per Minggu</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="h-[300px]">
        <ClientOnly>
          <LineChart
            v-if="chartLabels.length > 0"
            :labels="chartLabels"
            :data="chartData"
            :options="{
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Jumlah Entri'
                  },
                  ticks: {
                    stepSize: 1 // Pastikan skala Y adalah bilangan bulat
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Minggu'
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  enabled: true
                }
              }
            }"
          />
          <div v-else class="flex items-center justify-center h-full text-gray-500">
            Tidak ada data untuk menampilkan grafik overview mingguan.
          </div>
        </ClientOnly>
      </div>
    </CardContent>
  </Card>
</template>
