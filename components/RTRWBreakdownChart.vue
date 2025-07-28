<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNuxtApp } from '#app'
import type { Warga } from '@/types/warga'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore' // Import Firestore functions

// Import komponen chart kustom Anda
import BarChart from '~/components/BarChart.vue'
import LineChart from '~/components/LineChart.vue'

const { $firebase } = useNuxtApp()
const db = $firebase.db

const chartMode = ref<'overall' | 'RT' | 'RW'>('overall')
const chartType = ref<'bar' | 'line'>('line')
const chartLabels = ref<string[]>([])
const chartData = ref<number[]>([])
const isLoading = ref(false)

const props = defineProps<{
  allWarga: Warga[]
}>()

const emit = defineEmits(['refresh-dashboard'])

const processChartData = () => {
  if (props.allWarga.length === 0) {
    chartLabels.value = [];
    chartData.value = [];
    console.log('Tidak ada data warga untuk diproses chart.');
    return;
  }

  const groupedData: Record<string, { totalSkor: number, count: number }> = {}

  if (chartMode.value === 'overall') {
    props.allWarga.forEach(w => {
      if (typeof w.skorKelayakan === 'number') {
        const keyRT = `RT ${w.rt}`
        const keyRW = `RW ${w.rw}`

        if (!groupedData[keyRT]) {
          groupedData[keyRT] = { totalSkor: 0, count: 0 }
        }
        groupedData[keyRT].totalSkor += w.skorKelayakan
        groupedData[keyRT].count++

        if (!groupedData[keyRW]) {
          groupedData[keyRW] = { totalSkor: 0, count: 0 }
        }
        groupedData[keyRW].totalSkor += w.skorKelayakan
        groupedData[keyRW].count++
      }
    })

    const sortedKeys = Object.keys(groupedData).sort((a, b) => {
      const typeA = a.split(' ')[0];
      const numA = parseInt(a.split(' ')[1]);
      const typeB = b.split(' ')[0];
      const numB = parseInt(b.split(' ')[1]);

      if (typeA === typeB) {
        return numA - numB;
      }
      return typeA === 'RT' ? -1 : 1;
    });

    chartLabels.value = sortedKeys;
    chartData.value = sortedKeys.map(key => {
      const data = groupedData[key];
      return data.count > 0 ? parseFloat((data.totalSkor / data.count).toFixed(3)) : 0;
    });
    chartType.value = 'line';
  } else {
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
    chartType.value = 'line';
  }
  console.log('Chart Labels (after process):', chartLabels.value);
  console.log('Chart Data (after process):', chartData.value);
  console.log('Chart Type (after process):', chartType.value);
}

// --- Fungsi Konversi Skor Baru ---
const getSkorPenghasilan = (penghasilan: number): number => {
  if (penghasilan <= 1000000) return 1.0;
  if (penghasilan <= 2000000) return 0.8;
  if (penghasilan <= 3000000) return 0.6;
  return 0.3; // > 3.000.000
}

const getSkorTanggungan = (jumlahTanggungan: number): number => {
  if (jumlahTanggungan >= 4) return 1.0;
  if (jumlahTanggungan >= 2) return 0.8; // 2-3 orang
  if (jumlahTanggungan === 1) return 0.5;
  return 0.3; // 0 orang
}

const getSkorKondisiRumah = (kondisi?: string): number => {
  switch (kondisi?.toLowerCase()) {
    case 'tidak layak huni': return 1.0;
    case 'menumpang':
    case 'sewa': return 0.8;
    case 'rumah sendiri sederhana': return 0.6;
    case 'rumah permanen bagus': return 0.3;
    default: return 0.0; // Jika tidak ada data atau tidak cocok
  }
}

const getSkorPekerjaan = (status?: string): number => {
  switch (status?.toLowerCase()) {
    case 'tidak bekerja': return 1.0;
    case 'buruh harian': return 0.8;
    case 'pedagang kecil': return 0.7;
    case 'pekerja swasta': return 0.5;
    case 'pns':
    case 'pegawai tetap': return 0.3;
    default: return 0.0; // Jika tidak ada data atau tidak cocok
  }
}
// --- Akhir Fungsi Konversi Skor Baru ---

const hitungSMARTAndRefresh = async () => {
  isLoading.value = true;
  try {
    const snapshot = await getDocs(collection(db, 'data_warga'));
    const dataWargaSaatIni: Warga[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Warga));

    console.log('Fetched allWarga for SMART calculation:', dataWargaSaatIni);

    const dataKeluarga: Record<string, {
      anggota: Warga[],
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

    // Bobot Kriteria Baru
    const W_PENGHASILAN = 0.4;
    const W_TANGGUNGAN = 0.2;
    const W_KONDISI = 0.2;
    const W_PEKERJAAN = 0.2;

    const totalBobot = W_PENGHASILAN + W_TANGGUNGAN + W_KONDISI + W_PEKERJAAN;
    if (Math.abs(totalBobot - 1.0) > 0.001) {
      console.warn(`Total bobot kriteria tidak sama dengan 1.0! Total: ${totalBobot}`);
    }

    for (const nikKk in dataKeluarga) {
      const keluarga = dataKeluarga[nikKk];

      const skorPenghasilan = getSkorPenghasilan(keluarga.totalPenghasilan);
      const skorTanggungan = getSkorTanggungan(keluarga.totalTanggungan);
      const skorKondisi = getSkorKondisiRumah(keluarga.kondisiTempatTinggal);
      const skorPekerjaan = getSkorPekerjaan(keluarga.statusPekerjaan);

      const skorKelayakanKeluarga = parseFloat((
        skorPenghasilan * W_PENGHASILAN +
        skorTanggungan * W_TANGGUNGAN +
        skorKondisi * W_KONDISI +
        skorPekerjaan * W_PEKERJAAN
      ).toFixed(3));

      console.group(`Perhitungan SMART untuk NIK KK: ${nikKk}`);
      console.log(`  Penghasilan: Rp ${keluarga.totalPenghasilan.toLocaleString('id-ID')} -> Skor: ${skorPenghasilan.toFixed(3)} (Kontribusi: ${(skorPenghasilan * W_PENGHASILAN).toFixed(3)})`);
      console.log(`  Tanggungan: ${keluarga.totalTanggungan} orang -> Skor: ${skorTanggungan.toFixed(3)} (Kontribusi: ${(skorTanggungan * W_TANGGUNGAN).toFixed(3)})`);
      console.log(`  Kondisi Tempat Tinggal: ${keluarga.kondisiTempatTinggal} -> Skor: ${skorKondisi.toFixed(3)} (Kontribusi: ${(skorKondisi * W_KONDISI).toFixed(3)})`);
      console.log(`  Status Pekerjaan: ${keluarga.statusPekerjaan} -> Skor: ${skorPekerjaan.toFixed(3)} (Kontribusi: ${(skorPekerjaan * W_PEKERJAAN).toFixed(3)})`);
      console.log(`  Skor Akhir Kelayakan: ${skorKelayakanKeluarga}`);
      console.groupEnd();

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
}

watch([() => props.allWarga, chartMode], () => {
  processChartData()
}, { deep: true, immediate: true })
</script>

<template>
  <Card class="p-6">
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-lg font-semibold">Rata-rata Skor Kelayakan</CardTitle>
      <div class="flex gap-2">
        <Button
          size="sm"
          :variant="chartMode === 'overall' ? 'default' : 'outline'"
          @click="chartMode = 'overall'"
        >
          Keseluruhan
        </Button>
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
          :variant="chartType === 'bar' ? 'default' : 'outline'"
          @click="chartType = 'bar'"
        >
          Bar
        </Button>
        <Button
          size="sm"
          :variant="chartType === 'line' ? 'default' : 'outline'"
          @click="chartType = 'line'"
        >
          Line
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
        <ClientOnly>
          <BarChart v-if="chartType === 'bar'" :labels="chartLabels" :data="chartData" />
          <LineChart v-else :labels="chartLabels" :data="chartData" />
          <template #fallback>
            <div class="flex items-center justify-center h-full text-gray-500">
              Memuat grafik...
            </div>
          </template>
        </ClientOnly>
        <div v-if="chartLabels.length === 0 && !isLoading" class="flex items-center justify-center h-full text-gray-500">
          Tidak ada data untuk menampilkan grafik.
        </div>
      </div>
    </CardContent>
  </Card>
</template>
