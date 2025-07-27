<script setup lang="ts">
import { onMounted, ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { definePageMeta, useNuxtApp } from '#imports' // ✅ PERBAIKAN: Import definePageMeta dari #imports
import type { Warga } from '@/types/warga' // ✅ Import tipe Warga

const router = useRouter()
const { $firebase } = useNuxtApp()
const db = $firebase.db

const dataWarga = ref<Warga[]>([]) // ✅ Terapkan tipe Warga[]
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
  } as Warga)) // ✅ Cast ke tipe Warga
  isLoading.value = false
}

// ✅ PERBAIKAN: Logika SMART berbasis NIK KK
const hitungSMART = async () => {
  isLoading.value = true
  try {
    const { collection, getDocs, doc, updateDoc } = await import('firebase/firestore')
    const snapshot = await getDocs(collection(db, 'data_warga'));
    const dataWargaSaatIni: Warga[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Warga)); // ✅ Terapkan tipe Warga

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
    await fetchData(); // Refresh data setelah perhitungan
  } catch (error) {
    console.error('Gagal menghitung SMART:', error);
    alert('❌ Gagal menghitung SMART: ' + error);
  } finally {
    isLoading.value = false;
  }
}

// computed untuk pencarian + sorting
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

// Export ke Excel
const exportToExcel = async () => {
  if (process.client) {
    const fileSaver = await import('file-saver')
    const saveAs = fileSaver.saveAs
    const wsData = dataWarga.value.map((w: Warga) => ({ // ✅ Terapkan tipe Warga
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

// Export ke PDF
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
      body: dataWarga.value.map((w: Warga) => [ // ✅ Terapkan tipe Warga
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

onMounted(() => {
  fetchData()
})

definePageMeta({
  title: 'Output Data Warga',
  middleware: ['auth'],
})

// Import dinamis untuk jspdf dan file-saver
let jsPDF: any
let autoTable: any
let saveAs: any

// Modal state
const showEditModal = ref(false)
const selectedWarga = reactive<Warga>({ // ✅ Terapkan tipe Warga
  id: '',
  nama: '',
  nik: '',
  nik_kk: '',
  penghasilan: 0,
  jumlah_tanggungan: 0,
  kondisi_tempat_tinggal: '',
  status_pekerjaan: '',
  rt: 0, // Default ke 0 atau sesuaikan
  rw: 0  // Default ke 0 atau sesuaikan
})

// Buka modal dengan data
const editWarga = (warga: Warga) => { // ✅ Terapkan tipe Warga
  Object.assign(selectedWarga, warga)
  showEditModal.value = true
}

// Simpan hasil edit ke Firestore
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

// Fungsi untuk menghapus data warga
const deleteWarga = async (warga: Warga) => { // ✅ Terapkan tipe Warga
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
        <div class="overflow-x-auto">
          <Table class="min-w-full divide-y divide-gray-200">
            <TableHeader class="bg-gray-50">
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
