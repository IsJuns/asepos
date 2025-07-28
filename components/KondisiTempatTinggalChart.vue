<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Warga } from '@/types/warga'
import BarChart from '~/components/BarChart.vue' // Import BarChart

const props = defineProps<{
  allWarga: Warga[]
}>()

const chartLabels = ref<string[]>([])
const chartData = ref<number[]>([])

const processChartData = () => {
  if (!props.allWarga || props.allWarga.length === 0) {
    chartLabels.value = [];
    chartData.value = [];
    console.log('Tidak ada data warga untuk Kondisi Tempat Tinggal chart.');
    return;
  }

  const kondisiCounts: Record<string, number> = {};
  props.allWarga.forEach(warga => {
    const kondisi = warga.kondisi_tempat_tinggal || 'Tidak Diketahui';
    kondisiCounts[kondisi] = (kondisiCounts[kondisi] || 0) + 1;
  });

  // Urutkan kondisi tempat tinggal berdasarkan urutan yang logis atau abjad
  const sortedKondisi = Object.keys(kondisiCounts).sort();

  chartLabels.value = sortedKondisi;
  chartData.value = sortedKondisi.map(kondisi => kondisiCounts[kondisi]);

  console.log('Kondisi Tempat Tinggal Chart Labels:', chartLabels.value);
  console.log('Kondisi Tempat Tinggal Chart Data:', chartData.value);
}

watch(() => props.allWarga, () => {
  processChartData();
}, { deep: true, immediate: true });
</script>

<template>
  <Card class="p-6">
    <CardHeader>
      <CardTitle class="text-lg font-semibold">Distribusi Kondisi Tempat Tinggal</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="h-[300px]">
        <ClientOnly>
          <BarChart
            v-if="chartLabels.length > 0"
            :labels="chartLabels"
            :data="chartData"
            :options="{
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Jumlah Warga'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Kondisi Tempat Tinggal'
                  }
                }
              },
              plugins: {
                legend: {
                  display: false // Tidak perlu legend jika hanya satu dataset
                },
                tooltip: {
                  enabled: true
                }
              }
            }"
          />
          <div v-else class="flex items-center justify-center h-full text-gray-500">
            Tidak ada data untuk menampilkan grafik kondisi tempat tinggal.
          </div>
        </ClientOnly>
      </div>
    </CardContent>
  </Card>
</template>
