import { ref } from "vue"
import { useNuxtApp } from "#app"
import type { Warga } from "@/types/warga"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"

export function useDashboardData() {
  const { $firebase } = useNuxtApp()
  const db = $firebase.db

  const totalWarga = ref(0)
  const layak = ref(0)
  const pertimbangan = ref(0)
  const tidakLayak = ref(0)
  const allWarga = ref<Warga[]>([])
  const isLoading = ref(true)
  const recentWarga = ref<Warga[]>([])

  const fetchDashboardData = async () => {
    try {
      isLoading.value = true
      const snapshot = await getDocs(collection(db, "data_warga"))
      const data: Warga[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Warga,
      )

      allWarga.value = data
      totalWarga.value = data.length
      layak.value = data.filter((w) => (w.skorKelayakan ?? 0) >= 0.7).length
      pertimbangan.value = data.filter((w) => (w.skorKelayakan ?? 0) >= 0.4 && (w.skorKelayakan ?? 0) < 0.7).length
      tidakLayak.value = data.filter((w) => (w.skorKelayakan ?? 0) < 0.4).length

      const q = query(collection(db, "data_warga"), orderBy("timestamp", "desc"), limit(5))
      const recentSnapshot = await getDocs(q)
      recentWarga.value = recentSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Warga,
      )
    } catch (err) {
      console.error("Gagal mengambil data dashboard:", err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    totalWarga,
    layak,
    pertimbangan,
    tidakLayak,
    allWarga,
    isLoading,
    recentWarga,
    fetchDashboardData,
  }
}
