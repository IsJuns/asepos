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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog' // Import Dialog components

const router = useRouter()
const { $firebase } = useNuxtApp()
const db = $firebase.db

const allWarga = ref<Warga[]>([]) // Mengubah nama dari dataWarga menjadi allWarga untuk konsistensi
const isLoading = ref(false)
const searchQuery = ref('')
const sortBy = ref<'skor' | 'namaKepalaKeluarga' | 'nik_kk'>('skor') // Mengubah opsi sort
const showLayakOnly = ref(false) // Filter baru

// State untuk modal detail keluarga
const showDetailModal = ref(false)
const selectedFamilyMembers = ref<Warga[]>([])
const selectedFamilyHeadName = ref('')
const selectedFamilyNikKk = ref('')

const fetchData = async () => {
  isLoading.value = true
  const { collection, getDocs } = await import('firebase/firestore')
  const querySnapshot = await getDocs(collection(db, 'data_warga'))
  allWarga.value = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Warga))
  isLoading.value = false
}

// --- Fungsi Konversi Skor (sesuai kriteria Anda) ---
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
    default: return 0.0;
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
    default: return 0.0;
  }
}
// --- Akhir Fungsi Konversi Skor ---

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

// Struktur data untuk keluarga
interface FamilyData {
  nik_kk: string;
  namaKepalaKeluarga: string;
  skorKelayakan: number;
  statusKelayakan: string;
  rt: number;
  rw: number;
  anggota: Warga[];
}

const groupedFamilies = computed<FamilyData[]>(() => {
  const families: Record<string, FamilyData> = {};

  allWarga.value.forEach(warga => {
    if (!warga.nik_kk) return;

    if (!families[warga.nik_kk]) {
      families[warga.nik_kk] = {
        nik_kk: warga.nik_kk,
        namaKepalaKeluarga: warga.nama, // Ambil nama anggota pertama sebagai kepala keluarga
        skorKelayakan: warga.skorKelayakan || 0, // Ambil skor dari anggota ini (seharusnya sama untuk semua anggota keluarga)
        statusKelayakan: getStatusKelayakan(warga.skorKelayakan || 0),
        rt: warga.rt,
        rw: warga.rw,
        anggota: []
      };
    }
    families[warga.nik_kk].anggota.push(warga);
  });

  // Konversi objek ke array dan urutkan
  const sortedFamilies = Object.values(families).sort((a, b) => {
    if (sortBy.value === 'skor') {
      return b.skorKelayakan - a.skorKelayakan;
    } else if (sortBy.value === 'nik_kk') {
      return a.nik_kk.localeCompare(b.nik_kk);
    } else { // 'namaKepalaKeluarga'
      return a.namaKepalaKeluarga.localeCompare(b.namaKepalaKeluarga);
    }
  });

  return sortedFamilies;
});

const filteredFamilies = computed(() => {
  let filtered = groupedFamilies.value.filter(family =>
    family.namaKepalaKeluarga.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    family.nik_kk.toLowerCase().includes(searchQuery.value.toLowerCase())
  );

  if (showLayakOnly.value) {
    filtered = filtered.filter(family => family.statusKelayakan === 'Layak');
  }

  return filtered;
});

const getStatusKelayakan = (score: number): string => {
  if (score >= 0.8) return 'Layak';
  if (score >= 0.4) return 'Pertimbangan';
  return 'Tidak Layak';
}

const getScoreClass = (score?: number) => {
  if (score === undefined) return 'bg-gray-100 text-gray-800';
  if (score >= 0.8) return 'bg-green-100 text-green-800';
  if (score >= 0.4) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const exportToExcel = async () => {
  if (process.client) {
    const fileSaver = await import('file-saver')
    const saveAs = fileSaver.saveAs
    const wsData = filteredFamilies.value.map((family: FamilyData) => ({
      'Nama Kepala Keluarga': family.namaKepalaKeluarga,
      'NIK KK': family.nik_kk,
      RT: family.rt,
      RW: family.rw,
      'Skor Kelayakan': family.skorKelayakan,
      'Status Kelayakan': family.statusKelayakan,
      'Jumlah Anggota': family.anggota.length,
      // Anda bisa menambahkan detail anggota di sini jika diperlukan, tapi akan membuat Excel sangat lebar
    }))
    const worksheet = XLSX.utils.json_to_sheet(wsData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Keluarga')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, 'data-keluarga.xlsx')
  }
}

const exportToPDF = async () => {
  if (process.client) {
    const jspdfModule = await import('jspdf')
    const jsPDF = jspdfModule.default
    const autoTableModule = await import('jspdf-autotable')
    const autoTable = autoTableModule.default
    const doc = new jsPDF()
    doc.text('Data Keluarga & Skor Kelayakan', 14, 15)
    autoTable(doc, {
      head: [['Nama Kepala Keluarga', 'NIK KK', 'RT', 'RW', 'Skor', 'Status', 'Anggota']],
      body: filteredFamilies.value.map((family: FamilyData) => [
        family.namaKepalaKeluarga,
        family.nik_kk,
        family.rt,
        family.rw,
        family.skorKelayakan.toFixed(3),
        family.statusKelayakan,
        family.anggota.length
      ]),
      startY: 20,
    })
    doc.save('data-keluarga.pdf')
  }
}

const openDetailModal = (family: FamilyData) => {
  selectedFamilyMembers.value = family.anggota;
  selectedFamilyHeadName.value = family.namaKepalaKeluarga;
  selectedFamilyNikKk.value = family.nik_kk;
  showDetailModal.value = true;
}

const deleteFamily = async (nikKk: string) => {
  if (confirm(`Apakah Anda yakin ingin menghapus semua data untuk keluarga dengan NIK KK: ${nikKk}?`)) {
    try {
      const { collection, query, where, getDocs, deleteDoc } = await import('firebase/firestore')
      const q = query(collection(db, 'data_warga'), where('nik_kk', '==', nikKk));
      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);

      await fetchData(); // Refresh data setelah penghapusan
      alert('✅ Data keluarga berhasil dihapus!');
    } catch (error) {
      console.error('Gagal menghapus data keluarga:', error);
      alert('❌ Gagal menghapus data keluarga: ' + error);
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
        <CardTitle>Data Keluarga & Skor Kelayakan</CardTitle>
      </CardHeader>
      <CardContent>
        <!-- Search and Action Buttons -->
        <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
          <div class="flex gap-2 items-center w-full md:w-[250px]">
            <Input v-model="searchQuery" placeholder="Cari nama KK atau NIK KK..." class="w-full md:w-[250px]" />
          </div>
          <div class="flex flex-wrap gap-2">
            <Button @click="sortBy = 'skor'" :variant="sortBy === 'skor' ? 'default' : 'outline'">Urutkan Skor</Button>
            <Button @click="sortBy = 'namaKepalaKeluarga'" :variant="sortBy === 'namaKepalaKeluarga' ? 'default' : 'outline'">Urutkan Nama KK</Button>
            <Button @click="sortBy = 'nik_kk'" :variant="sortBy === 'nik_kk' ? 'default' : 'outline'">Urutkan NIK KK</Button>
            <Button @click="showLayakOnly = !showLayakOnly" :variant="showLayakOnly ? 'default' : 'outline'">
              {{ showLayakOnly ? 'Tampilkan Semua' : 'Filter Layak' }}
            </Button>
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
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kepala Keluarga</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK KK</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RT</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RW</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Anggota</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skor Kelayakan</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                <TableHead class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody class="bg-white divide-y divide-gray-200">
              <TableRow v-if="filteredFamilies.length === 0">
                <TableCell colspan="8" class="text-center text-muted-foreground py-4">
                  Tidak ada data keluarga yang ditemukan.
                </TableCell>
              </TableRow>
              <TableRow v-for="family in filteredFamilies" :key="family.nik_kk">
                <TableCell class="px-3 py-2 text-sm font-medium text-gray-900">{{ family.namaKepalaKeluarga }}</TableCell>
                <TableCell class="px-3 py-2 text-sm text-gray-500">{{ family.nik_kk }}</TableCell>
                <TableCell class="px-3 py-2 text-sm text-gray-500">{{ family.rt }}</TableCell>
                <TableCell class="px-3 py-2 text-sm text-gray-500">{{ family.rw }}</TableCell>
                <TableCell class="px-3 py-2 text-sm text-gray-500">{{ family.anggota.length }}</TableCell>
                <TableCell class="px-3 py-2 text-sm text-center">
                  <span
                    :class="getScoreClass(family.skorKelayakan)"
                    class="px-2 py-1 rounded-md text-xs font-medium"
                  >
                    {{ family.skorKelayakan.toFixed(3) }}
                  </span>
                </TableCell>
                <TableCell class="px-3 py-2 text-sm text-center">
                  <span
                    :class="getScoreClass(family.skorKelayakan)"
                    class="px-2 py-1 rounded-md text-xs font-medium"
                  >
                    {{ family.statusKelayakan }}
                  </span>
                </TableCell>
                <TableCell class="px-3 py-2 text-right text-sm font-medium whitespace-nowrap">
                  <Button variant="ghost" size="sm" class="text-blue-600 hover:text-blue-900" @click="openDetailModal(family)">Detail</Button>
                  <Button variant="ghost" size="sm" class="text-red-600 hover:text-red-900" @click="deleteFamily(family.nik_kk)">Hapus Keluarga</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Detail Keluarga Modal -->
    <Dialog :open="showDetailModal" @update:open="showDetailModal = $event">
      <DialogContent class="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Detail Keluarga: {{ selectedFamilyHeadName }} (NIK KK: {{ selectedFamilyNikKk }})</DialogTitle>
          <DialogDescription>
            Daftar anggota keluarga dan detail masing-masing.
          </DialogDescription>
        </DialogHeader>
        <div class="overflow-x-auto max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>NIK KTP</TableHead>
                <TableHead>Penghasilan</TableHead>
                <TableHead>Tanggungan</TableHead>
                <TableHead>Kondisi Rumah</TableHead>
                <TableHead>Pekerjaan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="member in selectedFamilyMembers" :key="member.id">
                <TableCell>{{ member.nama }}</TableCell>
                <TableCell>{{ member.nik }}</TableCell>
                <TableCell>{{ formatCurrency(member.penghasilan) }}</TableCell>
                <TableCell>{{ member.jumlah_tanggungan }}</TableCell>
                <TableCell>{{ member.kondisi_tempat_tinggal }}</TableCell>
                <TableCell>{{ member.status_pekerjaan }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div class="flex justify-end gap-2 pt-4">
          <Button variant="outline" @click="showDetailModal = false">Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
