import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc } from "firebase/firestore"

// PENTING: Ganti dengan konfigurasi proyek Firebase Anda yang sebenarnya.
// Untuk keamanan, JANGAN hardcode ini di lingkungan produksi.
// Jika menjalankan skrip ini langsung dengan Node.js, Anda mungkin perlu memuat ini
// dari file .env menggunakan paket seperti 'dotenv'.
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY", // Ganti ini
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN", // Ganti ini
  projectId: "YOUR_FIREBASE_PROJECT_ID", // Ganti ini
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET", // Ganti ini
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID", // Ganti ini
  appId: "YOUR_FIREBASE_APP_ID", // Ganti ini
}

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Definisi interface Warga (disalin dari types/warga.ts untuk skrip mandiri)
interface Warga {
  id?: string // Opsional untuk data baru
  nama: string
  nik: string // NIK KTP
  nik_kk: string // NIK Kartu Keluarga
  penghasilan: number
  jumlah_tanggungan: number
  kondisi_tempat_tinggal: string
  status_pekerjaan: string
  rt: number
  rw: number
  skorKelayakan?: number
  timestamp?: Date
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function generateAndSeedWargaData(numFamilies = 50) {
  console.log(`Menghasilkan ${numFamilies} data keluarga...`)
  const wargaRecordsToSeed: Omit<Warga, "id" | "skorKelayakan">[] = []

  const kondisiTempatTinggalOptions = ["Milik Sendiri", "Kontrak", "Menumpang"]
  const statusPekerjaanOptions = ["Bekerja", "Tidak Bekerja", "Pelajar/Mahasiswa"]

  for (let i = 0; i < numFamilies; i++) {
    // NIK KK unik untuk setiap keluarga
    const nikKk = `327300000000${String(i + 1).padStart(4, "0")}`
    const numDependents = getRandomInt(0, 5) // 0 hingga 5 tanggungan

    // Data Kepala Keluarga
    const headPenghasilan = getRandomInt(1000000, 8000000) // 1jt - 8jt
    const headTanggungan = numDependents // Kepala keluarga menghitung semua tanggungan
    const headKondisi = getRandomElement(kondisiTempatTinggalOptions)
    const headPekerjaan = getRandomElement(statusPekerjaanOptions)
    const headRt = getRandomInt(1, 10)
    const headRw = getRandomInt(1, 5)

    wargaRecordsToSeed.push({
      nama: `Kepala Keluarga ${i + 1}`,
      nik: `32730000000000${String(i + 1).padStart(4, "0")}01`, // NIK KTP unik
      nik_kk: nikKk,
      penghasilan: headPenghasilan,
      jumlah_tanggungan: headTanggungan,
      kondisi_tempat_tinggal: headKondisi,
      status_pekerjaan: headPekerjaan,
      rt: headRt,
      rw: headRw,
      timestamp: new Date(),
    })

    // Data Anggota Keluarga (Tanggungan)
    for (let j = 0; j < numDependents; j++) {
      const dependentPenghasilan = getRandomInt(0, 2000000) // 0 - 2jt (bisa pelajar, tidak bekerja, dll.)
      wargaRecordsToSeed.push({
        nama: `Anggota Keluarga ${i + 1}-${j + 1}`,
        nik: `32730000000000${String(i + 1).padStart(4, "0")}${String(j + 2).padStart(2, "0")}`, // NIK KTP unik
        nik_kk: nikKk,
        penghasilan: dependentPenghasilan,
        jumlah_tanggungan: 0, // Tanggungan tidak memiliki tanggungan sendiri dalam konteks ini
        kondisi_tempat_tinggal: headKondisi, // Sama dengan kepala keluarga
        status_pekerjaan: getRandomElement(statusPekerjaanOptions),
        rt: headRt,
        rw: headRw,
        timestamp: new Date(),
      })
    }
  }

  console.log(`Menyimpan ${wargaRecordsToSeed.length} catatan warga individu ke Firestore...`)
  const collectionRef = collection(db, "data_warga")

  for (const data of wargaRecordsToSeed) {
    await addDoc(collectionRef, data)
    console.log(`Ditambahkan catatan untuk NIK KK: ${data.nik_kk}, Nama: ${data.nama}`)
  }

  console.log("Penyemaian data selesai!")
}

// Jalankan fungsi
generateAndSeedWargaData(50).catch(console.error)
