<script setup lang="ts">
import { definePageMeta, ref, onMounted, useNuxtApp, computed } from "#imports";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useSystemMetrics } from '@/composables/useSystemMetrics'

definePageMeta({
  title: 'Settings',
  middleware: ['auth'],
})

const { metrics, confusionMatrix, isLoading, totalSamples, fetchMetrics, calculateConfusionMatrix } = useSystemMetrics()

// Contoh state untuk pengaturan
const smartWeightPenghasilan = ref(0.4)
const smartWeightTanggungan = ref(0.2)
const smartWeightKondisi = ref(0.2)
const smartWeightPekerjaan = ref(0.2)

const thresholdLayak = ref(0.8)
const thresholdPertimbangan = ref(0.4)

const currentDate = computed(() => {
  const date = new Date();
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
});

const saveSettings = () => {
  // Logika untuk menyimpan pengaturan ke database atau konfigurasi
  console.log('Pengaturan disimpan:', {
    smartWeightPenghasilan: smartWeightPenghasilan.value,
    smartWeightTanggungan: smartWeightTanggungan.value,
    smartWeightKondisi: smartWeightKondisi.value,
    smartWeightPekerjaan: smartWeightPekerjaan.value,
    thresholdLayak: thresholdLayak.value,
    thresholdPertimbangan: thresholdPertimbangan.value,
  })
  alert('Pengaturan berhasil disimpan! (Ini hanya simulasi)')
  // Di sini Anda akan mengintegrasikan dengan Firebase atau backend Anda
}
// Accuracy Script Report
// Meta tags untuk SEO
useHead({
  title: 'Tentang Sistem DSS SMART - Kelurahan Babakan Asih',
  meta: [
    { name: 'description', content: 'Informasi lengkap tentang sistem Decision Support System menggunakan metode SMART untuk penentuan kelayakan bantuan sosial' }
  ]
})

onMounted(async () => {
  fetchMetrics();
  await calculateConfusionMatrix();
});


</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Tutorial Penggunaan Aplikasi</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Selamat Datang di Sistem Pendukung Keputusan Kelayakan Bantuan Sosial</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <p class="text-sm text-muted-foreground">
          Aplikasi ini dirancang untuk membantu Anda dalam menentukan kelayakan penerima bantuan sosial dengan metode SMART.
          Berikut adalah panduan singkat untuk memulai dan memanfaatkan semua fitur yang tersedia.
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Panduan Cepat</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <Accordion type="single" collapsible class="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>1. Input Data Warga</AccordionTrigger>
            <AccordionContent>
              <p>
                Gunakan menu "Input Data Warga" untuk memasukkan informasi detail setiap individu atau kepala keluarga.
                Pastikan semua kolom terisi dengan benar, termasuk NIK KTP, NIK KK, penghasilan, jumlah tanggungan,
                kondisi tempat tinggal, status pekerjaan, RT, dan RW.
              </p>
              <p class="mt-2 text-sm text-muted-foreground">
                <strong>Tips:</strong> NIK KK sangat penting untuk mengelompokkan data per keluarga.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>2. Lihat Output Data</AccordionTrigger>
            <AccordionContent>
              <p>
                Setelah data diinput, kunjungi menu "Output Data" untuk melihat ringkasan data per keluarga.
                Di sini Anda dapat:
              </p>
              <ul class="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Melihat nama kepala keluarga, NIK KK, RT/RW, jumlah anggota, dan skor kelayakan.</li>
                <li>Menggunakan fitur pencarian untuk menemukan keluarga tertentu.</li>
                <li>Memfilter hanya keluarga yang "Layak" menerima bantuan.</li>
                <li>Mengurutkan data berdasarkan skor, nama, atau NIK KK.</li>
                <li>Mengekspor data ke format Excel atau PDF.</li>
                <li>Mengedit data keluarga atau menghapus data keluarga.</li>
                <li>Melihat detail anggota keluarga dengan tombol "Detail".</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>3. Dashboard Analisis</AccordionTrigger>
            <AccordionContent>
              <p>
                Halaman "Dashboard" menyediakan visualisasi data yang komprehensif:
              </p>
              <ul class="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Ringkasan jumlah keluarga "Layak", "Pertimbangan", dan "Tidak Layak".</li>
                <li>Grafik distribusi kelayakan (Pie Chart).</li>
                <li>Grafik rata-rata skor kelayakan per RT/RW.</li>
                <li>Grafik distribusi status pekerjaan dan kondisi tempat tinggal.</li>
                <li>Tombol "Hitung Ulang SMART" untuk memperbarui skor kelayakan setelah ada perubahan data atau kriteria.</li>
                <li>Aksi cepat untuk tambah, ekspor, dan impor data.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>4. Pengaturan SMART (Admin)</AccordionTrigger>
            <AccordionContent>
              <p>
                (Fitur ini biasanya hanya untuk administrator) Di menu "Pengaturan SMART", Anda dapat menyesuaikan bobot
                untuk setiap kriteria penilaian (penghasilan, tanggungan, kondisi rumah, pekerjaan)
                serta ambang batas skor untuk kategori "Layak" dan "Pertimbangan".
              </p>
              <p class="mt-2 text-sm text-muted-foreground">
                <strong>Penting:</strong> Perubahan pada pengaturan ini akan memengaruhi perhitungan skor kelayakan secara keseluruhan.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Pertanyaan Umum (FAQ)</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <Accordion type="single" collapsible class="w-full">
          <AccordionItem value="faq-1">
            <AccordionTrigger>Bagaimana cara kerja perhitungan SMART?</AccordionTrigger>
            <AccordionContent>
              <p>
                Metode SMART (Simple Multi-Attribute Rating Technique) menghitung skor kelayakan berdasarkan
                bobot yang diberikan pada setiap kriteria (penghasilan, tanggungan, kondisi rumah, pekerjaan).
                Setiap kriteria memiliki rentang skor tertentu, dan skor akhir adalah total dari skor kriteria
                yang dikalikan dengan bobotnya masing-masing.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-2">
            <AccordionTrigger>Mengapa skor kelayakan tidak berubah setelah input data baru?</AccordionTrigger>
            <AccordionContent>
              <p>
                Skor kelayakan dihitung secara manual atau saat Anda menekan tombol "Hitung Ulang SMART" di dashboard
                atau halaman output data. Pastikan Anda menekan tombol tersebut setelah melakukan perubahan data
                untuk memperbarui skor.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-3">
            <AccordionTrigger>Apakah data saya aman?</AccordionTrigger>
            <AccordionContent>
              <p>
                Ya, data Anda disimpan dengan aman di Firebase Firestore. Kami menerapkan praktik terbaik untuk
                melindungi informasi Anda.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Manajemen Kriteria SMART</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <p class="text-sm text-muted-foreground">Sesuaikan bobot untuk setiap kriteria penilaian kelayakan. Pastikan total bobot adalah 1.0.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="weight-penghasilan">Bobot Penghasilan</Label>
            <Input id="weight-penghasilan" v-model.number="smartWeightPenghasilan" type="number" step="0.01" min="0" max="1" />
          </div>
          <div class="space-y-2">
            <Label for="weight-tanggungan">Bobot Tanggungan</Label>
            <Input id="weight-tanggungan" v-model.number="smartWeightTanggungan" type="number" step="0.01" min="0" max="1" />
          </div>
          <div class="space-y-2">
            <Label for="weight-kondisi">Bobot Kondisi Tempat Tinggal</Label>
            <Input id="weight-kondisi" v-model.number="smartWeightKondisi" type="number" step="0.01" min="0" max="1" />
          </div>
          <div class="space-y-2">
            <Label for="weight-pekerjaan">Bobot Status Pekerjaan</Label>
            <Input id="weight-pekerjaan" v-model.number="smartWeightPekerjaan" type="number" step="0.01" min="0" max="1" />
          </div>
        </div>
        <div class="text-right text-sm font-medium">
          Total Bobot: {{ (smartWeightPenghasilan + smartWeightTanggungan + smartWeightKondisi + smartWeightPekerjaan).toFixed(2) }}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Ambang Batas Kelayakan</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <p class="text-sm text-muted-foreground">Tentukan nilai skor minimum untuk setiap kategori kelayakan.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="threshold-layak">Ambang Batas Layak (Skor ≥)</Label>
            <Input id="threshold-layak" v-model.number="thresholdLayak" type="number" step="0.01" min="0" max="1" />
          </div>
          <div class="space-y-2">
            <Label for="threshold-pertimbangan">Ambang Batas Pertimbangan (Skor ≥)</Label>
            <Input id="threshold-pertimbangan" v-model.number="thresholdPertimbangan" type="number" step="0.01" min="0" max="1" />
          </div>
        </div>
      </CardContent>
    </Card>
    
    <!-- Accuracy Report -->
    <Card>
      <CardHeader>
        <CardTitle>Accuracy Report</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Tentang Sistem DSS SMART</h1>
        <p class="text-gray-600">Decision Support System untuk Penentuan Kelayakan Bantuan Sosial</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Metodologi -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Metodologi SMART</h2>
            <div class="prose text-gray-600">
              <p class="mb-4">
                Sistem ini menggunakan metode <strong>SMART (Simple Multi-Attribute Rating Technique)</strong> 
                untuk menentukan kelayakan penerima bantuan sosial berdasarkan kriteria sosial ekonomi.
              </p>
              <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                <h3 class="font-semibold text-emerald-900 mb-2">Kriteria Penilaian:</h3>
                <ul class="text-sm text-emerald-800 space-y-1">
                  <li>• Penghasilan (Bobot: 40%)</li>
                  <li>• Jumlah Tanggungan (Bobot: 20%)</li>
                  <li>• Kondisi Tempat Tinggal (Bobot: 20%)</li>
                  <li>• Status Pekerjaan (Bobot: 20%)</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Performance Metrics -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Metrik Performa Sistem</h2>

            <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
              <h3 class="font-semibold text-emerald-900 mb-2 text-sm">Cara Kerja Perhitungan Metrik:</h3>
              <div class="text-xs text-emerald-800 space-y-2">
                <div>
                  <strong>1. Akurasi:</strong> Persentase prediksi yang benar dari semua data
                  <div class="bg-white p-2 mt-1 rounded font-mono text-xs">Akurasi = (Prediksi Benar / Total Data) × 100%</div>
                </div>
                <div>
                  <strong>2. Precision:</strong> Dari yang diprediksi positif, berapa yang benar-benar positif
                  <div class="bg-white p-2 mt-1 rounded font-mono text-xs">Precision = TP / (TP + FP) × 100%</div>
                </div>
                <div>
                  <strong>3. Recall (Sensitivity):</strong> Dari yang sebenarnya positif, berapa yang berhasil terdeteksi
                  <div class="bg-white p-2 mt-1 rounded font-mono text-xs">Recall = TP / (TP + FN) × 100%</div>
                </div>
                <div>
                  <strong>4. F1-Score:</strong> Rata-rata harmonis antara Precision dan Recall
                  <div class="bg-white p-2 mt-1 rounded font-mono text-xs">F1-Score = 2 × (Precision × Recall) / (Precision + Recall)</div>
                </div>
                <div class="mt-2 pt-2 border-t border-emerald-300">
                  <strong>Keterangan:</strong><br>
                  TP (True Positive) = Prediksi benar untuk kelas positif<br>
                  FP (False Positive) = Salah prediksi sebagai positif<br>
                  FN (False Negative) = Salah prediksi sebagai negatif
                </div>
              </div>
            </div>

            <!-- Overall Performance -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div class="text-center p-4 bg-emerald-50 rounded-lg">
                <div class="text-2xl font-bold text-emerald-600">{{ metrics.akurasi }}%</div>
                <div class="text-sm text-emerald-800">Akurasi</div>
              </div>
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ metrics.precision }}%</div>
                <div class="text-sm text-blue-800">Precision</div>
              </div>
              <div class="text-center p-4 bg-purple-50 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">{{ metrics.recall }}%</div>
                <div class="text-sm text-purple-800">Recall</div>
              </div>
              <div class="text-center p-4 bg-orange-50 rounded-lg">
                <div class="text-2xl font-bold text-orange-600">{{ metrics.f1score }}%</div>
                <div class="text-sm text-orange-800">F1-Score</div>
              </div>
            </div>

            <!-- Confusion Matrix -->
            <div class="mb-6">
              <h3 class="font-semibold text-gray-900 mb-3">Matriks Konfusi</h3>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 class="font-semibold text-blue-900 mb-2 text-sm">Penjelasan Matriks Konfusi:</h4>
                <div class="text-xs text-blue-800 space-y-2">
                  <p><strong>Baris (Prediksi):</strong> Hasil klasifikasi yang diprediksi oleh sistem SMART berdasarkan skor kelayakan</p>
                  <p><strong>Kolom (Aktual):</strong> Label sebenarnya dari data ground truth atau validasi ahli</p>
                  <p><strong>Diagonal (highlight):</strong> Prediksi yang benar. Semakin tinggi nilai diagonal, semakin akurat sistem</p>
                  <p><strong>Off-diagonal:</strong> Kesalahan klasifikasi. Nilai ini menunjukkan di mana sistem melakukan kesalahan</p>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-full border border-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="border border-gray-300 px-4 py-2 text-left">Prediksi \ Aktual</th>
                      <th class="border border-gray-300 px-4 py-2 text-center">Layak</th>
                      <th class="border border-gray-300 px-4 py-2 text-center">Pertimbangan</th>
                      <th class="border border-gray-300 px-4 py-2 text-center">Tidak Layak</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2 font-medium bg-gray-50">Layak</td>
                      <td class="border border-gray-300 px-4 py-2 text-center bg-emerald-100 font-bold">{{ confusionMatrix.Layak?.Layak || 0 }}</td>
                      <td class="border border-gray-300 px-4 py-2 text-center">{{ confusionMatrix.Layak?.Pertimbangan || 0 }}</td>
                      <td class="border border-gray-300 px-4 py-2 text-center">{{ confusionMatrix.Layak?.['Tidak Layak'] || 0 }}</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2 font-medium bg-gray-50">Pertimbangan</td>
                      <td class="border border-gray-300 px-4 py-2 text-center">{{ confusionMatrix.Pertimbangan?.Layak || 0 }}</td>
                      <td class="border border-gray-300 px-4 py-2 text-center bg-yellow-100 font-bold">{{ confusionMatrix.Pertimbangan?.Pertimbangan || 0 }}</td>
                      <td class="border border-gray-300 px-4 py-2 text-center">{{ confusionMatrix.Pertimbangan?.['Tidak Layak'] || 0 }}</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2 font-medium bg-gray-50">Tidak Layak</td>
                      <td class="border border-gray-300 px-4 py-2 text-center">{{ confusionMatrix['Tidak Layak']?.Layak || 0 }}</td>
                      <td class="border border-gray-300 px-4 py-2 text-center">{{ confusionMatrix['Tidak Layak']?.Pertimbangan || 0 }}</td>
                      <td class="border border-gray-300 px-4 py-2 text-center bg-red-100 font-bold">{{ confusionMatrix['Tidak Layak']?.['Tidak Layak'] || 0 }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mt-3 text-xs text-gray-600 bg-gray-50 p-3 rounded">
                <strong>Contoh Pembacaan:</strong> Jika sel [Layak, Pertimbangan] = 2, artinya ada 2 warga yang diprediksi "Layak" oleh sistem, tetapi sebenarnya masuk kategori "Pertimbangan"
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- System Status -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Status Sistem</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Status</span>
                <span class="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">Aktif</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Versi</span>
                <span class="text-sm font-medium">v1.2.0</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Data Training</span>
                <span class="text-sm font-medium">{{ totalSamples }} sampel</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Update Terakhir</span>
                <span class="text-sm font-medium">{{ currentDate }}</span>
              </div>
            </div>
          </div>

          <!-- Validation Info -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Validasi Model</h3>
            <div class="text-sm text-gray-600 space-y-2">
              <p><strong>Metode Validasi:</strong> K-Fold Cross Validation (k=5)</p>
              <p><strong>Dataset:</strong> Data Dumy</p>
              <p><strong>Periode:</strong> Jully - Agustus 2025</p>
              <p><strong>Expert Validation:</strong> Divalidasi oleh pembuat sistem</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Penjelasan Detail Metrik dengan Accordion -->
      <div class="mt-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Penjelasan Detail Metrik Evaluasi</h2>

          <Accordion type="single" collapsible class="w-full">
            <AccordionItem value="akurasi">
              <AccordionTrigger>Akurasi - Tingkat Ketepatan Keseluruhan</AccordionTrigger>
              <AccordionContent>
                <div class="space-y-3 text-sm">
                  <p><strong>Definisi:</strong> Akurasi mengukur seberapa sering sistem membuat prediksi yang benar dari keseluruhan data.</p>

                  <div class="bg-emerald-50 p-3 rounded">
                    <strong>Rumus:</strong>
                    <div class="font-mono mt-2">Akurasi = (Jumlah Prediksi Benar / Total Semua Data) × 100%</div>
                  </div>

                  <div class="bg-blue-50 p-3 rounded">
                    <strong>Contoh Perhitungan:</strong>
                    <p class="mt-2">Dari 150 data warga:</p>
                    <ul class="list-disc list-inside ml-3 mt-1">
                      <li>Prediksi benar: 147 warga</li>
                      <li>Prediksi salah: 3 warga</li>
                    </ul>
                    <p class="mt-2 font-mono">Akurasi = (147 / 150) × 100% = <strong class="text-emerald-600">98%</strong></p>
                  </div>

                  <p><strong>Interpretasi:</strong> Akurasi {{ metrics.akurasi }}% berarti sistem membuat prediksi yang benar sebanyak {{ metrics.akurasi }} kali dari 100 prediksi.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="precision">
              <AccordionTrigger>Precision - Ketepatan Prediksi Positif</AccordionTrigger>
              <AccordionContent>
                <div class="space-y-3 text-sm">
                  <p><strong>Definisi:</strong> Precision mengukur dari semua yang diprediksi "Layak", berapa persen yang benar-benar layak.</p>

                  <div class="bg-blue-50 p-3 rounded">
                    <strong>Rumus:</strong>
                    <div class="font-mono mt-2">Precision = TP / (TP + FP) × 100%</div>
                    <div class="mt-2 text-xs">
                      <strong>TP (True Positive):</strong> Diprediksi Layak, sebenarnya Layak ✓<br>
                      <strong>FP (False Positive):</strong> Diprediksi Layak, sebenarnya Tidak Layak ✗
                    </div>
                  </div>

                  <div class="bg-yellow-50 p-3 rounded">
                    <strong>Contoh Kasus:</strong>
                    <p class="mt-2">Sistem memprediksi 50 warga sebagai "Layak":</p>
                    <ul class="list-disc list-inside ml-3 mt-1">
                      <li>45 warga benar-benar layak (TP = 45)</li>
                      <li>5 warga ternyata tidak layak (FP = 5)</li>
                    </ul>
                    <p class="mt-2 font-mono">Precision = (45 / (45 + 5)) × 100% = <strong class="text-blue-600">90%</strong></p>
                  </div>

                  <p><strong>Pentingnya Precision:</strong> Precision tinggi berarti sedikit orang yang salah diberi bantuan (mengurangi kebocoran anggaran).</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="recall">
              <AccordionTrigger>Recall - Kemampuan Mendeteksi yang Layak</AccordionTrigger>
              <AccordionContent>
                <div class="space-y-3 text-sm">
                  <p><strong>Definisi:</strong> Recall mengukur dari semua yang sebenarnya "Layak", berapa persen yang berhasil dideteksi sistem.</p>

                  <div class="bg-purple-50 p-3 rounded">
                    <strong>Rumus:</strong>
                    <div class="font-mono mt-2">Recall = TP / (TP + FN) × 100%</div>
                    <div class="mt-2 text-xs">
                      <strong>TP (True Positive):</strong> Diprediksi Layak, sebenarnya Layak ✓<br>
                      <strong>FN (False Negative):</strong> Diprediksi Tidak Layak, sebenarnya Layak ✗
                    </div>
                  </div>

                  <div class="bg-yellow-50 p-3 rounded">
                    <strong>Contoh Kasus:</strong>
                    <p class="mt-2">Dari data aktual ada 48 warga yang benar-benar layak:</p>
                    <ul class="list-disc list-inside ml-3 mt-1">
                      <li>45 warga berhasil terdeteksi sistem (TP = 45)</li>
                      <li>3 warga terlewat/tidak terdeteksi (FN = 3)</li>
                    </ul>
                    <p class="mt-2 font-mono">Recall = (45 / (45 + 3)) × 100% = <strong class="text-purple-600">93.75%</strong></p>
                  </div>

                  <p><strong>Pentingnya Recall:</strong> Recall tinggi berarti sedikit orang layak yang terlewat (memastikan bantuan tepat sasaran).</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="f1score">
              <AccordionTrigger>F1-Score - Keseimbangan Precision & Recall</AccordionTrigger>
              <AccordionContent>
                <div class="space-y-3 text-sm">
                  <p><strong>Definisi:</strong> F1-Score adalah rata-rata harmonis antara Precision dan Recall, memberikan gambaran performa sistem secara seimbang.</p>

                  <div class="bg-orange-50 p-3 rounded">
                    <strong>Rumus:</strong>
                    <div class="font-mono mt-2">F1-Score = 2 × (Precision × Recall) / (Precision + Recall)</div>
                  </div>

                  <div class="bg-yellow-50 p-3 rounded">
                    <strong>Contoh Perhitungan:</strong>
                    <p class="mt-2">Jika Precision = 90% dan Recall = 93.75%:</p>
                    <div class="font-mono mt-2 text-xs">
                      F1-Score = 2 × (0.90 × 0.9375) / (0.90 + 0.9375)<br>
                      F1-Score = 2 × 0.84375 / 1.8375<br>
                      F1-Score = 1.6875 / 1.8375<br>
                      F1-Score = <strong class="text-orange-600">91.84%</strong>
                    </div>
                  </div>

                  <div class="bg-blue-50 p-3 rounded">
                    <strong>Interpretasi Nilai F1-Score:</strong>
                    <ul class="list-disc list-inside ml-3 mt-2 space-y-1">
                      <li><strong>90-100%:</strong> Sangat Baik - Sistem sangat akurat dan handal</li>
                      <li><strong>80-89%:</strong> Baik - Sistem cukup akurat dengan sedikit kesalahan</li>
                      <li><strong>70-79%:</strong> Cukup - Sistem perlu peningkatan</li>
                      <li><strong>&lt;70%:</strong> Kurang - Sistem perlu perbaikan signifikan</li>
                    </ul>
                  </div>

                  <p><strong>Pentingnya F1-Score:</strong> Metrik ini penting karena menyeimbangkan trade-off antara Precision dan Recall. Sangat berguna ketika data tidak seimbang.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="confusion-detail">
              <AccordionTrigger>Memahami Confusion Matrix Secara Mendalam</AccordionTrigger>
              <AccordionContent>
                <div class="space-y-3 text-sm">
                  <p><strong>Apa itu Confusion Matrix?</strong></p>
                  <p>Confusion Matrix adalah tabel yang menunjukkan performa sistem klasifikasi dengan membandingkan prediksi sistem vs kenyataan aktual.</p>

                  <div class="bg-gray-50 p-3 rounded">
                    <strong>Struktur Tabel:</strong>
                    <ul class="list-disc list-inside ml-3 mt-2 space-y-1">
                      <li><strong>Baris (Vertikal):</strong> Hasil PREDIKSI sistem</li>
                      <li><strong>Kolom (Horizontal):</strong> Label AKTUAL (ground truth)</li>
                      <li><strong>Sel Diagonal (hijau/kuning/merah):</strong> Prediksi BENAR</li>
                      <li><strong>Sel Off-diagonal (putih):</strong> Prediksi SALAH</li>
                    </ul>
                  </div>

                  <div class="bg-blue-50 p-3 rounded mt-3">
                    <strong>Contoh Pembacaan Matrix:</strong>
                    <table class="min-w-full border border-gray-300 mt-2 text-xs">
                      <thead class="bg-white">
                        <tr>
                          <th class="border border-gray-300 px-2 py-1">Prediksi \\ Aktual</th>
                          <th class="border border-gray-300 px-2 py-1">Layak</th>
                          <th class="border border-gray-300 px-2 py-1">Pertimbangan</th>
                          <th class="border border-gray-300 px-2 py-1">Tidak Layak</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td class="border border-gray-300 px-2 py-1 font-medium">Layak</td>
                          <td class="border border-gray-300 px-2 py-1 text-center bg-emerald-100">45</td>
                          <td class="border border-gray-300 px-2 py-1 text-center">2</td>
                          <td class="border border-gray-300 px-2 py-1 text-center">1</td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="mt-2 space-y-1">
                      <p>• <strong>45:</strong> Sistem prediksi "Layak", aktual "Layak" ✓ (BENAR)</p>
                      <p>• <strong>2:</strong> Sistem prediksi "Layak", aktual "Pertimbangan" ✗ (SALAH - terlalu tinggi)</p>
                      <p>• <strong>1:</strong> Sistem prediksi "Layak", aktual "Tidak Layak" ✗ (SALAH - sangat tinggi)</p>
                    </div>
                  </div>

                  <div class="bg-yellow-50 p-3 rounded mt-3">
                    <strong>Analisis Kesalahan:</strong>
                    <ul class="list-disc list-inside ml-3 mt-2 space-y-1">
                      <li><strong>False Positive:</strong> Warga diprediksi layak, padahal tidak → bantuan salah sasaran</li>
                      <li><strong>False Negative:</strong> Warga sebenarnya layak, tapi tidak terdeteksi → warga layak terlewat</li>
                    </ul>
                  </div>

                  <div class="bg-emerald-50 p-3 rounded mt-3">
                    <strong>Matrix Ideal:</strong>
                    <p class="mt-2">Matrix yang ideal memiliki nilai tinggi pada diagonal dan nilai 0 atau sangat kecil pada off-diagonal, menunjukkan sistem sangat akurat dengan minim kesalahan.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
  </div>
      </CardContent>
    </Card>

    <div class="flex justify-end">
      <Button @click="saveSettings">Simpan Pengaturan</Button>
    </div>
  </div>
</template>
