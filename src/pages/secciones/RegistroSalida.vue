<template>
  <div class="q-pa-md">
    <h3>📄 Movimientos de stock</h3>

    <q-table
      title="Listado de Registros"
      :rows="rows"
      :columns="columns"
      row-key="id"
      :pagination="pagination"
      :loading="loading"
      flat
      bordered
    >
      <template v-slot:body-cell-estado="props">
        <q-td
          :props="props"
          :class="{
            'text-negative': props.row.estado === 'sin resolver',
            'text-positive': props.row.estado === 'resuelto'
          }"
        >
          {{ props.row.estado }}
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="text-center q-pa-md">
          No hay registros disponibles
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const rows = ref([])
const loading = ref(true)

const columns = [
  { name: 'nombre', label: 'Nombre y Apellido', field: 'nombre', align: 'left' },
  { name: 'legajo', label: 'Legajo', field: 'legajo', align: 'left' },
  { name: 'modelo', label: 'Modelo', field: 'modelo', align: 'left' },
  { name: 'serie', label: 'N° de Serie', field: 'numeroSerie', align: 'left' },
  {
    name: 'fecha',
    label: 'Fecha de Ingreso',
    field: row => row.fecha?.toDate?.().toLocaleDateString() || '',
    align: 'left'
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'left'
  }
]

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
})

const fetchData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'stock'))
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    rows.value = data
  } catch (error) {
    console.error('Error al obtener datos de Firebase:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
