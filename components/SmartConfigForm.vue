<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ref } from 'vue'

// Bobot kriteria SMART (ini bisa diubah menjadi state yang bisa diedit dan disimpan ke DB di masa depan)
const criteria = ref([
  {
    name: 'Penghasilan',
    weight: 40,
    description: 'Tingkat penghasilan keluarga',
    color: 'bg-blue-500'
  },
  {
    name: 'Jumlah Tanggungan',
    weight: 20,
    description: 'Jumlah anggota keluarga',
    color: 'bg-green-500'
  },
  {
    name: 'Kondisi Tempat Tinggal',
    weight: 20,
    description: 'Status kepemilikan rumah',
    color: 'bg-yellow-500'
  },
  {
    name: 'Status Pekerjaan',
    weight: 20,
    description: 'Status pekerjaan kepala keluarga',
    color: 'bg-purple-500'
  }
])

const smartMethodExplanation = `
  Metode SMART (Simple Multi-Attribute Rating Technique) adalah pendekatan pengambilan keputusan multi-kriteria yang digunakan untuk mengevaluasi alternatif berdasarkan serangkaian atribut atau kriteria. Dalam konteks ini, SMART digunakan untuk menentukan kelayakan bantuan sosial berdasarkan kriteria yang telah ditetapkan.

  Langkah-langkah umum dalam metode SMART meliputi:
  1.  **Identifikasi Kriteria**: Menentukan faktor-faktor yang relevan untuk evaluasi (misalnya, penghasilan, jumlah tanggungan, kondisi tempat tinggal, status pekerjaan).
  2.  **Pembobotan Kriteria**: Menetapkan bobot relatif untuk setiap kriteria, mencerminkan tingkat kepentingannya dalam proses pengambilan keputusan. Total bobot harus 100%.
  3.  **Penilaian Alternatif**: Memberikan skor pada setiap alternatif (dalam kasus ini, setiap keluarga atau individu) untuk setiap kriteria.
  4.  **Normalisasi Skor**: Mengubah skor mentah menjadi skala yang seragam (misalnya, 0 hingga 1) untuk memungkinkan perbandingan antar kriteria.
  5.  **Perhitungan Skor Akhir**: Mengalikan skor yang dinormalisasi dengan bobot kriteria yang sesuai dan menjumlahkannya untuk mendapatkan skor kelayakan akhir.

  Skor kelayakan yang dihasilkan kemudian dapat digunakan untuk mengkategorikan penerima (Layak, Pertimbangan, Tidak Layak) berdasarkan ambang batas yang ditentukan.
`

const saveSettings = () => {
  // Logika untuk menyimpan pengaturan ke Firestore atau API di masa depan
  alert('Pengaturan disimpan (simulasi). Di implementasi nyata, ini akan disimpan ke database.')
  console.log('Current SMART Criteria:', criteria.value)
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-lg font-semibold">Konfigurasi Kriteria SMART</CardTitle>
    </CardHeader>
    <CardContent class="space-y-6">
      <div class="space-y-4">
        <h3 class="text-md font-semibold">Bobot Kriteria</h3>
        <div v-for="(criterion, index) in criteria" :key="criterion.name" class="space-y-2">
          <div class="flex justify-between items-center">
            <div>
              <Label :for="`weight-${index}`" class="font-medium text-sm">{{ criterion.name }}</Label>
              <p class="text-xs text-muted-foreground">{{ criterion.description }}</p>
            </div>
            <div class="flex items-center gap-2">
              <Input
                :id="`weight-${index}`"
                v-model.number="criterion.weight"
                type="number"
                min="0"
                max="100"
                class="w-20 text-right"
              />
              <span class="font-bold text-sm">%</span>
            </div>
          </div>
          <Progress :value="criterion.weight" class="h-2" />
        </div>
        <Button @click="saveSettings" class="w-full">Simpan Pengaturan</Button>
      </div>

      <div class="space-y-4">
        <h3 class="text-md font-semibold">Penjelasan Metode SMART</h3>
        <div class="p-4 bg-muted rounded-lg text-sm text-muted-foreground leading-relaxed">
          <p class="whitespace-pre-wrap">{{ smartMethodExplanation }}</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
