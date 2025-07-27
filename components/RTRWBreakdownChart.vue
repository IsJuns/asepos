<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNuxtApp } from '#app'
import type { Warga } from '~/types/warga' // ✅ Import tipe Warga

const { $firebase } = useNuxtApp()
const db = $firebase.db

// Register Chart.js components
const ChartJSInstance = ChartJS
ChartJSInstance.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartMode = ref<'RT' | 'RW'>('RT')
const chartLabels = ref<string[]>([])
const chartData = ref<number[]>([])
const isLoading = ref(false)

const props = defineProps<{
  allWarga: Warga[] // ✅ Terapkan tipe Warga[]
}>()

const emit = defineEmits(['refresh-dashboard'])

const chartOptions = {
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
        text: 'RT/RW'
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y.toFixed(3);
          }
          return label;
        }
      }
    }
  }
}

const processChartData = () => {
  const groupedData: Record<string, { totalSkor: number, count: number }> = {}

  props.allWarga.forEach(w => {
    if (typeof w.skorKelayakan === 'number') {
      const key = chartMode.value === 'RT' ? `RT ${w.rt}` : `RW ${w.rw}`
      if (!groupedData[key]) {
        groupedData[key] = { totalSkor: 0, count: 0 }
      }
      groupedData[key].totalSkor += w.skorKelayakan
      groupedData[key].count++
    }
  })

  const sortedKeys = Object.keys(groupedData).sort((a, b) => {
    const numA = parseInt(a.split(' ')[1])
    const numB = parseInt(b.split(' ')[1])
    return numA - numB
  })

  chartLabels.value = sortedKeys
  chartData.value = sortedKeys.map(key => {
    const data = groupedData[key]
    return data.count > 0 ? parseFloat((data.totalSkor / data.count).toFixed(3)) : 0
  })
}

const chartDataset = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: 'Rata-rata Skor Kelayakan',
      backgroundColor: '#42A5F5',
      data: chartData.value
    }
  ]
}))

watch([() => props.allWarga, chartMode], () => {
  processChartData()
}, { deep: true, immediate: true })

const hitungSMARTAndRefresh = async () => {
  isLoading.value = true;
  try {
    const { collection, getDocs, doc, updateDoc } = await import('firebase/firestore')
    const snapshot = await getDocs(collection(db, 'data_warga'));
    const dataWargaSaatIni: Warga[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Warga)); // ✅ Terapkan tipe Warga

    // ✅ PERBAIKAN: Agregasi data per NIK KK
    const dataKeluarga: Record<string, {
      anggota: Warga[], // ✅ Terapkan tipe Warga
      totalPenghasilan: number,
      totalTanggungan: number,
      kondisiTempatTinggal: string,
      statusPekerjaan: string,
      rt: number,
      rw: number
    }> = {};

    dataWargaSaatIni.forEach(w => {
      const nikKk = w.nik_kk;
      if (!nikKk) return;

      if (!dataKeluarga[nikKk]) {
        dataKeluarga[nikKk] = {
          anggota: [],
          totalPenghasilan: 0,
          totalTanggungan: 0,
          kondisiTempatTinggal: w.kondisi_tempat_tinggal,
          statusPekerjaan: w.status_pekerjaan,
          rt: w.rt,
          rw: w.rw
        };
      }
      dataKeluarga[nikKk].anggota.push(w);
      dataKeluarga[nikKk].totalPenghasilan += w.penghasilan || 0;
      dataKeluarga[nikKk].totalTanggungan += w.jumlah_tanggungan || 0;
    });

    const allPenghasilanKeluarga = Object.values(dataKeluarga).map(k => k.totalPenghasilan);
    const allTanggunganKeluarga = Object.values(dataKeluarga).map(k => k.totalTanggungan);

    const maxPenghasilanKeluarga = allPenghasilanKeluarga.length > 0 ? Math.max(...allPenghasilanKeluarga) : 1;
    const minPenghasilanKeluarga = allPenghasilanKeluarga.length > 0 ? Math.min(...allPenghasilanKeluarga) : 0;
    const maxTanggunganKeluarga = allTanggunganKeluarga.length > 0 ? Math.max(...allTanggunganKeluarga) : 1;
    const minTanggunganKeluarga = allTanggunganKeluarga.length > 0 ? Math.min(...allTanggunganKeluarga) : 0;

    for (const nikKk in dataKeluarga) {
      const keluarga = dataKeluarga[nikKk];

      const normPenghasilan = (maxPenghasilanKeluarga - keluarga.totalPenghasilan) / (maxPenghasilanKeluarga - minPenghasilanKeluarga || 1);
      const normTanggungan = (keluarga.totalTanggungan - minTanggunganKeluarga) / (maxTanggunganKeluarga - minTanggunganKeluarga || 1);
      const skorKondisi = getSkorKondisi(keluarga.kondisiTempatTinggal);
      const skorPekerjaan = getSkorPekerjaan(keluarga.statusPekerjaan);
      const normKondisi = (3 - skorKondisi) / 2;
      const normPekerjaan = (skorPekerjaan - 1) / 2;

      const skorKelayakanKeluarga = parseFloat((
        normPenghasilan * 0.4 +
        normTanggungan * 0.2 +
        normKondisi * 0.2 +
        normPekerjaan * 0.2
      ).toFixed(3));

      // Update skorKelayakan untuk setiap anggota keluarga
      for (const anggota of keluarga.anggota) {
        const wargaRef = doc(db, 'data_warga', anggota.id);
        await updateDoc(wargaRef, { skorKelayakan: skorKelayakanKeluarga });
      }
    }
    alert('✅ Perhitungan SMART berhasil & skor tersimpan!');
    emit('refresh-dashboard');
  } catch (error) {
    console.error('Gagal menghitung SMART:', error);
    alert('❌ Gagal menghitung SMART: ' + error);
  } finally {
    isLoading.value = false;
  }
};

const getSkorKondisi = (val: string) => {
  switch (val) {
    case 'Menumpang': return 1
    case 'Kontrak': return 2
    case 'Milik Sendiri': return 3
    default: return 3
  }
}

const getSkorPekerjaan = (val: string) => {
  switch (val) {
    case 'Tidak Bekerja': return 1
    case 'Pelajar/Mahasiswa': return 2
    case 'Bekerja': return 3
    default: return 3
  }
}
</script>

<template>
  <Card class="p-6">
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-lg font-semibold">Rata-rata Skor Kelayakan per {{ chartMode }}</CardTitle>
      <div class="flex gap-2">
        <Button
          size="sm"
          :variant="chartMode === 'RT' ? 'default' : 'outline'"
          @click="chartMode = 'RT'"
        >
          Per RT
        </Button>
        <Button
          size="sm"
          :variant="chartMode === 'RW' ? 'default' : 'outline'"
          @click="chartMode = 'RW'"
        >
          Per RW
        </Button>
        <Button
          size="sm"
          variant="secondary"
          @click="hitungSMARTAndRefresh"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Menghitung...' : 'Hitung Ulang SMART' }}
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div class="h-[300px]">
        <Bar :data="chartDataset" :options="chartOptions" />
      </div>
    </CardContent>
  </Card>
</template>
