export interface Warga {
  id: string
  nama: string
  nik: string // NIK KTP
  nik_kk: string // NIK Kartu Keluarga
  penghasilan: number
  jumlah_tanggungan: number
  kondisi_tempat_tinggal: string
  status_pekerjaan: string
  rt: number
  rw: number
  skorKelayakan?: number // Opsional, karena mungkin belum dihitung
  timestamp?: Date // Opsional, jika ada timestamp
}
