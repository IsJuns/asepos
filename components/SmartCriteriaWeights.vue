<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// Bobot kriteria SMART
const criteria = [
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
]
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-lg font-semibold">Bobot Kriteria SMART</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div v-for="criterion in criteria" :key="criterion.name" class="space-y-2">
        <div class="flex justify-between items-center">
          <div>
            <p class="font-medium text-sm">{{ criterion.name }}</p>
            <p class="text-xs text-muted-foreground">{{ criterion.description }}</p>
          </div>
          <span class="font-bold text-sm">{{ criterion.weight }}%</span>
        </div>
        <Progress :value="criterion.weight" class="h-2" />
      </div>
      
      <div class="mt-4 p-3 bg-muted rounded-lg">
        <p class="text-xs text-muted-foreground">
          <strong>Metode SMART:</strong> Simple Multi-Attribute Rating Technique digunakan untuk menentukan kelayakan bantuan sosial berdasarkan kriteria yang telah ditetapkan.
        </p>
      </div>
    </CardContent>
  </Card>
</template>
