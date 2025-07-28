// ✅ PERBAIKAN: Impor dotenv secara eksplisit dan panggil config()
import dotenv from "dotenv"
// ✅ BARU: Tambahkan try-catch di sekitar dotenv.config()
try {
  dotenv.config()
  console.log("dotenv loaded successfully.")
} catch (e: any) {
  console.error(
    "ERROR: Failed to load .env file. Make sure it exists in the root directory and is correctly formatted.",
    e.message || e,
  )
  process.exit(1) // Keluar jika .env gagal dimuat
}

import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string,
}

console.log("--- DEBUG: Firebase Config Values ---")
console.log("API Key:", firebaseConfig.apiKey ? "Loaded" : "MISSING")
console.log("Auth Domain:", firebaseConfig.authDomain ? "Loaded" : "MISSING")
console.log("Project ID:", firebaseConfig.projectId ? "Loaded" : "MISSING")
console.log("Storage Bucket:", firebaseConfig.storageBucket ? "Loaded" : "MISSING")
console.log("Messaging Sender ID:", firebaseConfig.messagingSenderId ? "Loaded" : "MISSING")
console.log("App ID:", firebaseConfig.appId ? "Loaded" : "MISSING")
console.log("Measurement ID:", firebaseConfig.measurementId ? "Loaded" : "MISSING")
console.log("------------------------------------")

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error("ERROR: Firebase environment variables are not fully configured. Please check your .env file.")
  process.exit(1)
}

let app: any
let db: any
try {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  console.log("Firebase initialized successfully.")
} catch (initError: any) {
  console.error("ERROR: Failed to initialize Firebase. Check your config and network.", initError.message || initError)
  process.exit(1)
}

interface Warga {
  id?: string
  nama: string
  nik: string
  nik_kk: string
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

const firstNames = [
  "Budi", "Siti", "Agus", "Dewi", "Joko", "Ani", "Rina", "Fajar", "Lina", "Eko",
  "Maya", "Rio", "Putri", "Andi", "Nurul", "Dian", "Bayu", "Citra", "Hadi", "Wati",
]
const lastNames = [
  "Santoso", "Wijaya", "Susanto", "Dewi", "Pratama", "Utami", "Saputra", "Rahayu", "Nugroho", "Lestari",
  "Setiawan", "Handayani", "Kusuma", "Puspita", "Aditya", "Sari", "Permana", "Fitri", "Hidayat", "Indah",
]

function generateRandomName(): string {
  const firstName = getRandomElement(firstNames)
  const lastName = getRandomElement(lastNames)
  return `${firstName} ${lastName}`
}

// ✅ BARU: Opsi kondisi tempat tinggal yang lebih detail
const kondisiTempatTinggalOptions = [
  "Tidak Layak Huni",
  "Menumpang",
  "Sewa",
  "Rumah Sendiri Sederhana",
  "Rumah Permanen Bagus",
]

// ✅ BARU: Opsi status pekerjaan yang lebih detail
const statusPekerjaanOptions = [
  "Tidak Bekerja",
  "Buruh Harian",
  "Pedagang Kecil",
  "Pekerja Swasta",
  "PNS",
  "Pegawai Tetap",
  "Pelajar/Mahasiswa",
]

// Helper untuk menghasilkan data yang cenderung masuk kategori tertentu
function generateFamilyDataForCategory(category: 'Layak' | 'Pertimbangan' | 'Tidak Layak') {
  let penghasilan: number;
  let jumlahTanggungan: number;
  let kondisiTempatTinggal: string;
  let statusPekerjaan: string;

  switch (category) {
    case 'Layak':
      // Cenderung mendapatkan skor tinggi
      penghasilan = getRandomInt(500000, 1500000); // <= 1.000.000 (skor 1.0) atau sedikit di atas
      jumlahTanggungan = getRandomInt(3, 6); // >= 4 (skor 1.0) atau 2-3 (skor 0.8)
      kondisiTempatTinggal = getRandomElement(["Tidak Layak Huni", "Menumpang", "Sewa"]); // Skor 1.0 atau 0.8
      statusPekerjaan = getRandomElement(["Tidak Bekerja", "Buruh Harian", "Pedagang Kecil"]); // Skor 1.0, 0.8, 0.7
      break;
    case 'Pertimbangan':
      // Cenderung mendapatkan skor menengah
      penghasilan = getRandomInt(1500001, 3500000); // Campuran 0.8, 0.6, 0.3
      jumlahTanggungan = getRandomInt(1, 3); // Campuran 0.8, 0.5
      kondisiTempatTinggal = getRandomElement(["Sewa", "Rumah Sendiri Sederhana"]); // Skor 0.8, 0.6
      statusPekerjaan = getRandomElement(["Pedagang Kecil", "Pekerja Swasta"]); // Skor 0.7, 0.5
      break;
    case 'Tidak Layak':
      // Cenderung mendapatkan skor rendah
      penghasilan = getRandomInt(3000001, 10000000); // > 3.000.000 (skor 0.3)
      jumlahTanggungan = getRandomInt(0, 1); // 0 (skor 0.3) atau 1 (skor 0.5)
      kondisiTempatTinggal = getRandomElement(["Rumah Permanen Bagus", "Rumah Sendiri Sederhana"]); // Skor 0.3, 0.6
      statusPekerjaan = getRandomElement(["PNS", "Pegawai Tetap", "Pelajar/Mahasiswa"]); // Skor 0.3
      break;
    default:
      // Fallback to random if category is not recognized
      penghasilan = getRandomInt(500000, 8000000);
      jumlahTanggungan = getRandomInt(0, 5);
      kondisiTempatTinggal = getRandomElement(kondisiTempatTinggalOptions);
      statusPekerjaan = getRandomElement(statusPekerjaanOptions);
  }

  return { penghasilan, jumlahTanggungan, kondisiTempatTinggal, statusPekerjaan };
}


async function generateAndSeedWargaData(numFamilies = 50) {
  console.log(`Menghasilkan ${numFamilies} data keluarga...`)
  const wargaRecordsToSeed: Omit<Warga, "id" | "skorKelayakan">[] = []

  const categories = ['Layak', 'Pertimbangan', 'Tidak Layak'];
  const familiesPerCategory = Math.floor(numFamilies / categories.length);
  let currentFamilyIndex = 0;

  for (let i = 0; i < numFamilies; i++) {
    const nikKk = `327300000000${String(i + 1).padStart(4, "0")}`
    const headRt = getRandomInt(1, 10)
    const headRw = getRandomInt(1, 5)

    // Determine category for this family
    const categoryIndex = Math.min(Math.floor(i / familiesPerCategory), categories.length - 1);
    const targetCategory = categories[categoryIndex] as 'Layak' | 'Pertimbangan' | 'Tidak Layak';

    const { penghasilan, jumlahTanggungan, kondisiTempatTinggal, statusPekerjaan } = generateFamilyDataForCategory(targetCategory);

    const numDependents = getRandomInt(0, 3); // Keep dependents low for simplicity in seeding

    // Kepala Keluarga
    wargaRecordsToSeed.push({
      nama: generateRandomName(),
      nik: `32730000000000${String(i + 1).padStart(4, "0")}01`,
      nik_kk: nikKk,
      penghasilan: penghasilan,
      jumlah_tanggungan: jumlahTanggungan, // Tanggungan utama keluarga
      kondisi_tempat_tinggal: kondisiTempatTinggal,
      status_pekerjaan: statusPekerjaan,
      rt: headRt,
      rw: headRw,
      timestamp: new Date(),
    })

    // Anggota Keluarga (jika ada)
    for (let j = 0; j < numDependents; j++) {
      const dependentPenghasilan = getRandomInt(0, 1000000); // Penghasilan anggota keluarga cenderung lebih rendah
      wargaRecordsToSeed.push({
        nama: generateRandomName(),
        nik: `32730000000000${String(i + 1).padStart(4, "0")}${String(j + 2).padStart(2, "0")}`,
        nik_kk: nikKk,
        penghasilan: dependentPenghasilan,
        jumlah_tanggungan: 0, // Anggota keluarga tidak menambah tanggungan keluarga secara langsung
        kondisi_tempat_tinggal: kondisiTempatTinggal, // Kondisi rumah sama untuk semua anggota keluarga
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
    try {
      await addDoc(collectionRef, data)
    } catch (error: any) {
      console.error(
        `ERROR: Gagal menambahkan data untuk NIK KK: ${data.nik_kk}, Nama: ${data.nama}. Error:`,
        error.message || error,
      )
    }
  }
  console.log("Penyemaian data selesai!")
}

generateAndSeedWargaData(60).catch(console.error) // Mengubah jumlah keluarga menjadi 60 agar lebih mudah dibagi 3 kategori