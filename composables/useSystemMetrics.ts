import { ref, computed } from "vue";
import { useNuxtApp } from "#app";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import type { Warga } from "@/types/warga";

type Label = "Layak" | "Pertimbangan" | "Tidak Layak";

interface ConfusionMatrix {
  [key: string]: {
    [key: string]: number;
  };
}

interface SystemMetrics {
  akurasi: number;
  precision: number;
  recall: number;
  f1score: number;
  confusionMatrix?: ConfusionMatrix;
  totalSamples?: number;
  updatedAt?: Date;
}

export function useSystemMetrics() {
  const { $firebase } = useNuxtApp();
  const db = $firebase.db;

  const metrics = ref<SystemMetrics>({
    akurasi: 0,
    precision: 0,
    recall: 0,
    f1score: 0,
  });

  const confusionMatrix = ref<ConfusionMatrix>({
    Layak: { Layak: 0, Pertimbangan: 0, "Tidak Layak": 0 },
    Pertimbangan: { Layak: 0, Pertimbangan: 0, "Tidak Layak": 0 },
    "Tidak Layak": { Layak: 0, Pertimbangan: 0, "Tidak Layak": 0 },
  });

  const isLoading = ref(true);

  const totalSamples = computed(() => {
    let total = 0;
    Object.values(confusionMatrix.value).forEach((row) => {
      Object.values(row).forEach((value) => {
        total += value;
      });
    });
    return total;
  });

  const fetchMetrics = () => {
    const metricsRef = doc(db, "system", "metrics");

    onSnapshot(metricsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SystemMetrics;
        metrics.value = {
          akurasi: data.akurasi || 0,
          precision: data.precision || 0,
          recall: data.recall || 0,
          f1score: data.f1score || 0,
          totalSamples: data.totalSamples,
          updatedAt: data.updatedAt,
        };

        if (data.confusionMatrix) {
          confusionMatrix.value = data.confusionMatrix;
        }

        isLoading.value = false;
        console.log("📊 Metrics loaded from Firebase:", data);
      } else {
        console.warn("⚠️ Metrics document not found in Firebase");
        isLoading.value = false;
      }
    });
  };

  const calculateConfusionMatrix = async () => {
    try {
      const wargaRef = collection(db, "data_warga");
      const querySnap = await getDocs(wargaRef);
      const data = querySnap.docs.map((d) => d.data() as Warga);

      const matrix: ConfusionMatrix = {
        Layak: { Layak: 0, Pertimbangan: 0, "Tidak Layak": 0 },
        Pertimbangan: { Layak: 0, Pertimbangan: 0, "Tidak Layak": 0 },
        "Tidak Layak": { Layak: 0, Pertimbangan: 0, "Tidak Layak": 0 },
      };

      data.forEach((warga) => {
        const actual = warga.status_aktual || "Tidak Layak";
        const predicted = warga.hasil_sistem || "Tidak Layak";

        if (matrix[predicted] && matrix[predicted][actual] !== undefined) {
          matrix[predicted][actual]++;
        }
      });

      confusionMatrix.value = matrix;
      console.log("✅ Confusion Matrix Updated:", matrix);

      return matrix;
    } catch (error) {
      console.error("❌ Error calculating confusion matrix:", error);
      return confusionMatrix.value;
    }
  };

  return {
    metrics,
    confusionMatrix,
    isLoading,
    totalSamples,
    fetchMetrics,
    calculateConfusionMatrix,
  };
}
