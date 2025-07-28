<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNuxtApp } from '#app'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { definePageMeta } from '#imports'

definePageMeta({
  title: 'Input Data Warga',
  middleware: ['auth'],
})

const { $firebase } = useNuxtApp()
const db = $firebase.db

const nama = ref('')
const nik = ref('')
const nikKk = ref('')
const penghasilan = ref('')
const jumlahTanggungan = ref('')
const kondisiTempatTinggal = ref('')
const statusPekerjaan = ref('')
const rt = ref('')
const rw = ref('')

const submitForm = async () => {
  if (
    !nama.value ||
    !nik.value ||
    !nikKk.value ||
    penghasilan.value === '' || isNaN(parseFloat(penghasilan.value)) ||
    jumlahTanggungan.value === '' || isNaN(parseInt(jumlahTanggungan.value)) ||
    !kondisiTempatTinggal.value ||
    !statusPekerjaan.value ||
    !rt.value || !rw.value
  ) {
    alert('⚠️ Harap lengkapi semua data!')
    return
  }
  try {
    const { collection, addDoc } = await import('firebase/firestore')

    await addDoc(collection(db, 'data_warga'), {
      nama: nama.value,
      nik: nik.value,
      nik_kk: nikKk.value,
      penghasilan: parseFloat(penghasilan.value),
      jumlah_tanggungan: parseInt(jumlahTanggungan.value),
      kondisi_tempat_tinggal: kondisiTempatTinggal.value,
      status_pekerjaan: statusPekerjaan.value,
      rt: parseInt(rt.value),
      rw: parseInt(rw.value),
      timestamp: new Date()
    })
    alert('✅ Data berhasil disimpan!')
    nama.value = ''
    nik.value = ''
    nikKk.value = ''
    penghasilan.value = ''
    jumlahTanggungan.value = ''
    kondisiTempatTinggal.value = ''
    statusPekerjaan.value = ''
    rt.value = ''
    rw.value = ''
  } catch (e) {
    alert('❌ Gagal menyimpan: ' + e)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Input Data Warga</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Form Input Data Warga</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- 🔷 Nama -->
        <div class="space-y-2">
          <Label>Nama</Label>
          <Input v-model="nama" placeholder="Masukkan nama" />
        </div>
        <!-- 🔷 NIK KTP -->
        <div class="space-y-2">
          <Label>NIK KTP</Label>
          <Input v-model="nik" placeholder="Masukkan NIK KTP" />
        </div>
        <!-- ✅ BARU: NIK KK -->
        <div class="space-y-2">
          <Label>NIK Kartu Keluarga (KK)</Label>
          <Input v-model="nikKk" placeholder="Masukkan NIK Kartu Keluarga" />
        </div>
        <!-- 🔷 Penghasilan -->
        <div class="space-y-2">
          <Label>Penghasilan</Label>
          <Input v-model="penghasilan" type="number" placeholder="Masukkan penghasilan (angka)" />
        </div>
        <!-- 🔷 Tanggungan -->
        <div class="space-y-2">
          <Label>Jumlah Tanggungan</Label>
          <Input v-model="jumlahTanggungan" type="number" placeholder="Masukkan jumlah tanggungan" />
        </div>
        <!-- 🔷 RT -->
        <div class="space-y-2">
          <Label>RT</Label>
          <Input v-model="rt" type="number" placeholder="Masukkan RT : 00" />
        </div>
        <!-- 🔷 RW -->
        <div class="space-y-2">
          <Label>RW</Label>
          <Input v-model="rw" type="number" placeholder="Masukkan RW : 00" />
        </div>
        <!-- 🔷 Kondisi Tempat Tinggal -->
        <div class="space-y-2">
          <Label>Kondisi Tempat Tinggal</Label>
          <Select v-model="kondisiTempatTinggal">
            <SelectTrigger>
              <SelectValue placeholder="Pilih kondisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tidak Layak Huni">Tidak Layak Huni</SelectItem>
              <SelectItem value="Menumpang">Menumpang</SelectItem>
              <SelectItem value="Sewa">Sewa</SelectItem>
              <SelectItem value="Rumah Sendiri Sederhana">Rumah Sendiri Sederhana</SelectItem>
              <SelectItem value="Rumah Permanen Bagus">Rumah Permanen Bagus</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <!-- 🔷 Status Pekerjaan -->
        <div class="space-y-2">
          <Label>Status Pekerjaan</Label>
          <Select v-model="statusPekerjaan">
            <SelectTrigger>
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tidak Bekerja">Tidak Bekerja</SelectItem>
              <SelectItem value="Buruh Harian">Buruh Harian</SelectItem>
              <SelectItem value="Pedagang Kecil">Pedagang Kecil</SelectItem>
              <SelectItem value="Pekerja Swasta">Pekerja Swasta</SelectItem>
              <SelectItem value="PNS">PNS</SelectItem>
              <SelectItem value="Pegawai Tetap">Pegawai Tetap</SelectItem>
              <SelectItem value="Pelajar/Mahasiswa">Pelajar/Mahasiswa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <!-- 🔘 Tombol Simpan -->
        <Button class="w-full mt-4" @click="submitForm">Simpan</Button>
      </CardContent>
    </Card>
  </div>
</template>
