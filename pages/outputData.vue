<script setup lang="ts">
import { onMounted, ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { definePageMeta, useNuxtApp } from '#imports'
import type { Warga } from '@/types/warga'

const router = useRouter()
const { $firebase } = useNuxtApp()
const db = $firebase.db

const dataWarga = ref<Warga[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const sortBy = ref<'nama' | 'skor' | 'nik_kk'>('skor')

const fetchData = async () => {
  isLoading.value = true
  const { collection, getDocs } = await import('firebase/firestore')
  const querySnapshot = await getDocs(collection(db, 'data_warga'))
  dataWarga.value = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Warga))
  isLoading.value = false
}

// --- Fungsi Konversi Skor Baru (sesuai kriteria Anda) ---
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

const hitungSMART = async () => {
  isLoading.value = true
  try {
    const { collection, getDocs, doc, updateDoc } = await import('firebase/firestore')
    const snapshot = await getDocs(collection(db, 'data_warga'));
    const dataWargaSaatIni: Warga[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Warga));

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
    await fetchData(); // Refresh data di tabel setelah perhitungan
  } catch (error) {
    console.error('Gagal menghitung SMART:', error);
    alert('❌ Gagal menghitung SMART: ' + error);
  } finally {
    isLoading.value = false;
  }
}

const filteredWarga = computed(() => {
  const filtered = dataWarga.value.filter(w =>
    w.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (w.nik_kk && w.nik_kk.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
  if (sortBy.value === 'skor') {
    return [...filtered].sort((a, b) => (b.skorKelayakan || 0) - (a.skorKelayakan || 0))
  } else if (sortBy.value === 'nik_kk') {
    return [...filtered].sort((a, b) => (a.nik_kk || '').localeCompare(b.nik_kk || ''))
  } else {
    return [...filtered].sort((a, b) => a.nama.localeCompare(b.nama))
  }
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const getScoreClass = (score?: number) => {
  if (score === undefined) return 'bg-gray-100 text-gray-800';
  if (score >= 0.7) return 'bg-green-100 text-green-800';
  if (score >= 0.4) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

const exportToExcel = async () => {
  if (process.client) {
    const fileSaver = await import('file-saver')
    const saveAs = fileSaver.saveAs
    const wsData = dataWarga.value.map((w: Warga) => ({
      Nama: w.nama,
      'NIK KTP': w.nik,
      'NIK KK': w.nik_kk,
      Penghasilan: w.penghasilan,
      Tanggungan: w.jumlah_tanggungan,
      'Kondisi Tempat Tinggal': w.kondisi_tempat_tinggal,
      'Status Pekerjaan': w.status_pekerjaan,
      'Skor Kelayakan': w.skorKelayakan ?? '-',
    }))
    const worksheet = XLSX.utils.json_to_sheet(wsData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Warga')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, 'data-warga.xlsx')
  }
}

const exportToPDF = async () => {
  if (process.client) {
    const jspdfModule = await import('jspdf')
    const jsPDF = jspdfModule.default
    const autoTableModule = await import('jspdf-autotable')
    const autoTable = autoTableModule.default
    const doc = new jsPDF()
    doc.text('Data Warga & Skor Kelayakan', 14, 15)
    autoTable(doc, {
      head: [['Nama', 'NIK KTP', 'NIK KK', 'Penghasilan', 'Tanggungan', 'Kondisi', 'Pekerjaan', 'Skor']],
      body: dataWarga.value.map((w: Warga) => [
        w.nama,
        w.nik,
        w.nik_kk,
        `Rp${w.penghasilan.toLocaleString()}`,
        w.jumlah_tanggungan,
        w.kondisi_tempat_tinggal,
        w.status_pekerjaan,
        w.skorKelayakan ?? '-'
      ]),
      startY: 20,
    })
    doc.save('data-warga.pdf')
  }
}

const showEditModal = ref(false)
const selectedWarga = reactive<Warga>({
  id: '',
  nama: '',
  nik: '',
  nik_kk: '',
  penghasilan: 0,
  jumlah_tanggungan: 0,
  kondisi_tempat_tinggal: '',
  status_pekerjaan: '',
  rt: 0,
  rw: 0
})

const editWarga = (warga: Warga) => {
  Object.assign(selectedWarga, warga)
  showEditModal.value = true
}

const simpanPerubahan = async () => {
  if (!selectedWarga.id) return
  try {
    const { doc, updateDoc } = await import('firebase/firestore')
    const wargaRef = doc(db, 'data_warga', selectedWarga.id)
    await updateDoc(wargaRef, {
      nama: selectedWarga.nama,
      nik: selectedWarga.nik,
      nik_kk: selectedWarga.nik_kk,
      penghasilan: selectedWarga.penghasilan,
      jumlah_tanggungan: selectedWarga.jumlah_tanggungan,
      kondisi_tempat_tinggal: selectedWarga.kondisi_tempat_tinggal,
      status_pekerjaan: selectedWarga.status_pekerjaan,
      rt: selectedWarga.rt,
      rw: selectedWarga.rw
    })
    showEditModal.value = false
    await fetchData()
    alert('✅ Data berhasil diperbarui!')
  } catch (error) {
    alert('❌ Gagal memperbarui data: ' + error)
  }
}

const deleteWarga = async (warga: Warga) => {
  if (confirm(`Apakah Anda yakin ingin menghapus data ${warga.nama} (NIK: ${warga.nik})?`)) {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      await deleteDoc(doc(db, 'data_warga', warga.id))
      await fetchData()
      alert('✅ Data berhasil dihapus!')
    } catch (error) {
      alert('❌ Gagal menghapus data: ' + error)
    }
  }
}

onMounted(() => {
  fetchData()
})

definePageMeta({
  title: 'Output Data Warga',
  middleware: ['auth'],
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Output Data Warga</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Data Warga & Skor Kelayakan</CardTitle>
      </CardHeader>
      <CardContent>
        <!-- Search and Action Buttons -->
        <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
          <div class="flex gap-2 items-center w-full md:w-[250px]">
            <Input v-model="searchQuery" placeholder="Cari nama atau NIK KK..." class="w-full md:w-[250px]" />
          </div>
          <div class="flex flex-wrap gap-2">
            <Button @click="sortBy = 'skor'" :variant="sortBy === 'skor' ? 'default' : 'outline'">Urutkan Skor</Button>
            <Button @click="sortBy = 'nama'" :variant="sortBy === 'nama' ? 'default' : 'outline'">Urutkan Nama</Button>
            <Button @click="sortBy = 'nik_kk'" :variant="sortBy === 'nik_kk' ? 'default' : 'outline'">Urutkan NIK KK</Button>
            <Button @click="hitungSMART" :disabled="isLoading">
              {{ isLoading ? 'Memuat...' : 'Hitung SMART' }}
            </Button>
            <Button variant="outline" @click="exportToExcel">Export ke Excel</Button>
            <Button variant="outline" @click="exportToPDF">Export ke PDF</Button>
          </div>
        </div>

        <!-- Data Table -->
        <div class="overflow-x-auto max-h-[calc(100vh-350px)] overflow-y-auto">
          <Table class="min-w-full divide-y divide-gray-200">
            <TableHeader class="bg-gray-50 sticky top-0 z-10">
              <TableRow>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK KTP</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK KK</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penghasilan</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggungan</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RT</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RW</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kondisi</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pekerjaan</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skor Kelayakan</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody class="bg-white divide-y divide-gray-200">
              <TableRow v-for="warga in filteredWarga" :key="warga.id">
                <TableCell class="px-3 py-2 text-sm font-medium text-gray-900">{{ warga.nama }}</TableCell>
                <TableCell class="px-3 py-2 text-sm text-gray-500">{{ warga.nik }}</TableCell>
                <TableCell class="px-3 py-2 text-sm text-gray-500">{{ warga.nik_kk }}</TableCell>
                <TableCell class="px-3 py-2 text-sm text-gray-500">{{ formatCurrency(warga.penghasilan) }}</TableCell>
                <TableCell class="px-3 py-2 text-sm text-gray-500">{{ warga.jumlah_tanggungan }}</TableCell>
                <TableCell class="px-3 py-2 text-sm text-gray-500">{{ warga.rt }}</TableCell>
                <TableCell class="px-3 py-2 text-sm text-gray-500">{{ warga.rw }}</TableCell>
                <TableCell class="px-3 py-2 text-sm text-gray-500">{{ warga.kondisi_tempat_tinggal }}</TableCell>
                <TableCell class="px-3 py-2 text-sm text-gray-500">{{ warga.status_pekerjaan }}</TableCell>
                <TableCell class="px-3 py-2 text-sm text-center">
                  <span
                    v-if="warga.skorKelayakan !== undefined"
                    :class="getScoreClass(warga.skorKelayakan)"
                    class="px-2 py-1 rounded-md text-xs font-medium"
                  >
                    {{ warga.skorKelayakan.toFixed(3) }}
                  </span>
                  <span v-else class="text-muted-foreground">-</span>
                </TableCell>
                <TableCell class="px-3 py-2 text-right text-sm font-medium whitespace-nowrap">
                  <Button variant="ghost" size="sm" class="text-blue-600 hover:text-blue-900" @click="editWarga(warga)">Edit</Button>
                  <Button variant="ghost" size="sm" class="text-red-600 hover:text-red-900" @click="deleteWarga(warga)">Hapus</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-xl shadow-md w-full max-w-xl space-y-4">
        <h2 class="text-lg font-semibold mb-4">Edit Data Warga</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium">Nama</label>
            <Input v-model="selectedWarga.nama" />
          </div>
          <div>
            <label class="block text-sm font-medium">NIK KTP</label>
            <Input v-model="selectedWarga.nik" />
          </div>
          <div>
            <label class="block text-sm font-medium">NIK Kartu Keluarga (KK)</label>
            <Input v-model="selectedWarga.nik_kk" />
          </div>
          <div>
            <label class="block text-sm font-medium">Penghasilan</label>
            <Input v-model.number="selectedWarga.penghasilan" type="number" />
          </div>
          <div>
            <label class="block text-sm font-medium">Tanggungan</label>
            <Input v-model.number="selectedWarga.jumlah_tanggungan" type="number" />
          </div>
          <div>
            <label class="block text-sm font-medium">RT</label>
            <Input v-model.number="selectedWarga.rt" type="number" />
          </div>
          <div>
            <label class="block text-sm font-medium">RW</label>
            <Input v-model.number="selectedWarga.rw" type="number" />
          </div>
          <div>
            <label class="block text-sm font-medium">Kondisi Tempat Tinggal</label>
            <Input v-model="selectedWarga.kondisi_tempat_tinggal" />
          </div>
          <div>
            <label class="block text-sm font-medium">Status Pekerjaan</label>
            <Input v-model="selectedWarga.status_pekerjaan" />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-4">
          <Button variant="outline" size="sm" @click="showEditModal = false">
            Batal
          </Button>
          <Button variant="default" @click="simpanPerubahan">Simpan</Button>
        </div>
      </div>
    </div>
  </div>
</template>
