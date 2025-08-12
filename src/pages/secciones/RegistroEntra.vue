<template>
  <div class="q-pa-md">
    <h3>📄 PC / Maquinas Pendientes</h3>

    <q-table
      title="Listado de Registros Pendientes"
      :rows="rows"
      :columns="columns"
      row-key="id"
      :pagination="pagination"
      :loading="loading"
      flat
      bordered
    >
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge
            v-if="props.row.estado === 'resuelto'"
            color="positive"
            text-color="white"
            align="center"
            class="q-pa-xs"
          >
            {{ props.row.estado }}
          </q-badge>
          <q-badge
            v-else
            color="negative"
            text-color="white"
            align="center"
            class="q-pa-xs"
          >
            {{ props.row.estado }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            color="primary"
            icon="picture_as_pdf"
            label="Exportar PDF"
            size="sm"
            @click="exportarPDF(props.row)"
          />
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
import jsPDF from 'jspdf'

const rows = ref([])
const loading = ref(true)

const columns = [
  { name: 'nombre', label: 'Nombre y Apellido', field: 'nombre', align: 'left' },
  { name: 'legajo', label: 'Legajo', field: 'legajo', align: 'left' },
  { name: 'area', label: 'Area', field: 'area', align: 'left' },
  { name: 'tipoEquipo', label: 'Tipo de equipo', field: 'tipoEquipo', align: 'left' },
  { name: 'modelo', label: 'Modelo', field: 'modelo', align: 'left' },
  { name: 'serie', label: 'N° de Serie', field: 'numeroSerie', align: 'left' },
  { name: 'fecha', label: 'Fecha de Ingreso', field: row => row.fecha?.toDate?.().toLocaleDateString() || '', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  { name: 'actions', label: 'Acciones', align: 'center' }
]

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
})

const fetchData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'stock'))
    let data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Filtrar solo los que están sin resolver
    data = data.filter(item => item.estado === 'sin resolver')

    // Ordenar de más nuevo a más viejo por fecha
    data.sort((a, b) => {
      const fechaA = a.fecha?.seconds ?? 0
      const fechaB = b.fecha?.seconds ?? 0
      return fechaB - fechaA
    })

    rows.value = data
  } catch (error) {
    console.error('Error al obtener datos de Firebase:', error)
  } finally {
    loading.value = false
  }
}

const exportarPDF = (row) => {
  const doc = new jsPDF()
  const fecha = row.fecha?.toDate?.().toLocaleDateString() || 'Sin fecha'
  const usuario = row.usuario || 'No especificado'

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Registro de Movimiento de Stock', 105, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Fecha de emisión: ${fecha}`, 20, 35)

  doc.setDrawColor(0)
  doc.line(20, 40, 190, 40)

  let y = 50
  const lineSpacing = 10

  const agregarDato = (label, value) => {
    doc.setFont('helvetica', 'bold')
    doc.text(`${label}:`, 20, y)
    doc.setFont('helvetica', 'normal')
    doc.text(`${value || '-'}`, 70, y)
    y += lineSpacing
  }

  agregarDato('Entrego', row.nombre)
  agregarDato('Legajo', row.legajo)
  agregarDato('Área', row.area)
  agregarDato('Tipo de equipo', row.tipoEquipo)
  agregarDato('Modelo', row.modelo)
  agregarDato('N° de Serie', row.numeroSerie)
  agregarDato('Registro', usuario)

  y += 140
  doc.setFont('helvetica', 'normal')
  doc.text('Firma: ________________________________', 20, y)
  y += 10
  doc.text('Aclaración: ___________________________', 20, y)

  doc.save(`registro-${row.legajo || row.id}.pdf`)
}

onMounted(() => {
  fetchData()
})
</script>
