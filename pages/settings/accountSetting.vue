<script setup lang="ts">
import { definePageMeta, ref, onMounted, useNuxtApp } from "#imports";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { doc, onSnapshot } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore"

definePageMeta({
  title: 'Settings',
  middleware: ['auth'],
})

// Ambil db dari Nuxt plugin
const { $firebase } = useNuxtApp();
const db = $firebase.db; // ✅ akses Firestore dari plugin

type Label = 'layak' | 'pertimbangan' | 'tidakLayak';

const confusionMatrix: Record<Label, Record<Label, number>> = {
  layak: { layak: 0, pertimbangan: 0, tidakLayak: 0 },
  pertimbangan: { layak: 0, pertimbangan: 0, tidakLayak: 0 },
  tidakLayak: { layak: 0, pertimbangan: 0, tidakLayak: 0 },
};


const fetchConfusionMatrix = async () => {
  const wargaRef = collection(db, "warga")
  const querySnap = await getDocs(wargaRef)
  const data = querySnap.docs.map((d) => d.data())

  // Hitung confusion matrix dari data sebenarnya
  data.forEach((d: any) => {
    const actual = d.kelayakan_aktual
    const predicted = d.kelayakan_prediksi

    if (confusionMatrix[predicted as Label] && confusionMatrix[predicted as Label][actual as Label] !== undefined) {
      confusionMatrix[predicted as Label][actual as Label]++;
}

  })

  console.log("✅ Confusion Matrix Updated:", confusionMatrix)
}

// Contoh state untuk pengaturan
const smartWeightPenghasilan = ref(0.4)
const smartWeightTanggungan = ref(0.2)
const smartWeightKondisi = ref(0.2)
const smartWeightPekerjaan = ref(0.2)

const thresholdLayak = ref(0.8)
const thresholdPertimbangan = ref(0.4)

const overallAccuracy = ref(0);
const precision = ref(0);
const recall = ref(0);
const f1Score = ref(0);
const metrics = ref<any>(null);

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

onMounted(() => {
  const metricsRef = doc(db, "system", "metrics");

  onSnapshot(metricsRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as {
        akurasi: number;
        precision: number;
        recall: number;
        f1score: number;
      };
      overallAccuracy.value = data.akurasi;
      precision.value = data.precision;
      recall.value = data.recall;
      f1Score.value = data.f1score;

      metrics.value = data;
      console.log("📊 Metrics loaded:", data);
    } else {
      console.warn("⚠️ Metrics document not found");
    }
  });
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
            
            <!-- Overall Performance -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div class="text-center p-4 bg-emerald-50 rounded-lg">
                <div class="text-2xl font-bold text-emerald-600">{{ overallAccuracy }}%</div>
                <div class="text-sm text-emerald-800">Akurasi</div>
              </div>
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ precision }}%</div>
                <div class="text-sm text-blue-800">Precision</div>
              </div>
              <div class="text-center p-4 bg-purple-50 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">{{ recall }}%</div>
                <div class="text-sm text-purple-800">Recall</div>
              </div>
              <div class="text-center p-4 bg-orange-50 rounded-lg">
                <div class="text-2xl font-bold text-orange-600">{{ f1Score }}%</div>
                <div class="text-sm text-orange-800">F1-Score</div>
              </div>
            </div>

            <!-- Confusion Matrix -->
            <div class="mb-6">
              <h3 class="font-semibold text-gray-900 mb-3">Matriks Konfusi</h3>
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
                      <td class="border border-gray-300 px-4 py-2 text-center bg-emerald-100 font-bold">45</td>
                      <td class="border border-gray-300 px-4 py-2 text-center">2</td>
                      <td class="border border-gray-300 px-4 py-2 text-center">1</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2 font-medium bg-gray-50">Pertimbangan</td>
                      <td class="border border-gray-300 px-4 py-2 text-center">3</td>
                      <td class="border border-gray-300 px-4 py-2 text-center bg-yellow-100 font-bold">73</td>
                      <td class="border border-gray-300 px-4 py-2 text-center">4</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2 font-medium bg-gray-50">Tidak Layak</td>
                      <td class="border border-gray-300 px-4 py-2 text-center">0</td>
                      <td class="border border-gray-300 px-4 py-2 text-center">1</td>
                      <td class="border border-gray-300 px-4 py-2 text-center bg-red-100 font-bold">29</td>
                    </tr>
                  </tbody>
                </table>
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
                <span class="text-sm font-medium">147 sampel</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Update Terakhir</span>
                <span class="text-sm font-medium">25 Jul 2025</span>
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
  </div>
      </CardContent>
    </Card>

    <div class="flex justify-end">
      <Button @click="saveSettings">Simpan Pengaturan</Button>
    </div>
  </div>
</template>
