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

async function generateAndSeedWargaData(numFamilies = 50) {
  console.log(`Menghasilkan ${numFamilies} data keluarga...`)
  const wargaRecordsToSeed: Omit<Warga, "id" | "skorKelayakan">[] = []

  const kondisiTempatTinggalOptions = ["Milik Sendiri", "Kontrak", "Menumpang"]
  const statusPekerjaanOptions = ["Bekerja", "Tidak Bekerja", "Pelajar/Mahasiswa"]

  for (let i = 0; i < numFamilies; i++) {
    const nikKk = `327300000000${String(i + 1).padStart(4, "0")}`
    const numDependents = getRandomInt(0, 5)
    const headPenghasilan = getRandomInt(1000000, 8000000)
    const headTanggungan = numDependents
    const headKondisi = getRandomElement(kondisiTempatTinggalOptions)
    const headPekerjaan = getRandomElement(statusPekerjaanOptions)
    const headRt = getRandomInt(1, 10)
    const headRw = getRandomInt(1, 5)

    wargaRecordsToSeed.push({
      nama: `Kepala Keluarga ${i + 1}`,
      nik: `32730000000000${String(i + 1).padStart(4, "0")}01`,
      nik_kk: nikKk,
      penghasilan: headPenghasilan,
      jumlah_tanggungan: headTanggungan,
      kondisi_tempat_tinggal: headKondisi,
      status_pekerjaan: headPekerjaan,
      rt: headRt,
      rw: headRw,
      timestamp: new Date(),
    })

    for (let j = 0; j < numDependents; j++) {
      const dependentPenghasilan = getRandomInt(0, 2000000)
      wargaRecordsToSeed.push({
        nama: `Anggota Keluarga ${i + 1}-${j + 1}`,
        nik: `32730000000000${String(i + 1).padStart(4, "0")}${String(j + 2).padStart(2, "0")}`,
        nik_kk: nikKk,
        penghasilan: dependentPenghasilan,
        jumlah_tanggungan: 0,
        kondisi_tempat_tinggal: headKondisi,
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
      // console.log(`Ditambahkan catatan untuk NIK KK: ${data.nik_kk}, Nama: ${data.nama}`)
    } catch (error: any) {
      console.error(
        `ERROR: Gagal menambahkan data untuk NIK KK: ${data.nik_kk}, Nama: ${data.nama}. Error:`,
        error.message || error,
      )
    }
  }

  console.log("Penyemaian data selesai!")
}

generateAndSeedWargaData(50).catch(console.error)
