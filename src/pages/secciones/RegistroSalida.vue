<template>
  <div class="q-pa-md">
    <h3>📄 PC / Maquinas Resueltas</h3>

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
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            color="primary"
            icon="picture_as_pdf"
            label="Exportar PDF"
            size="sm"
            @click="exportarPDF(props.row)"
          />
          <q-btn
            color="secondary"
            icon="info"
            label="Ver Detalle"
            size="sm"
            class="q-ml-sm"
            @click="abrirModal(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge
            v-if="props.value === 'resuelto'"
            color="positive"
            text-color="white"
            align="center"
            class="q-pa-xs"
          >
            {{ props.value }}
          </q-badge>
          <q-badge
            v-else
            color="grey-5"
            text-color="black"
            align="center"
            class="q-pa-xs"
          >
            {{ props.value }}
          </q-badge>
        </q-td>
      </template>
      <template v-slot:no-data>
        <div class="text-center q-pa-md">No hay registros disponibles</div>
      </template>
    </q-table>

    <!-- Modal Detalle -->
    <q-dialog v-model="modalOpen">
      <q-card style="min-width: 600px;">
        <q-card-section>
          <div class="row">
            <div class="col-6">
              <div class="text-h6">Entregó</div>
              <div><strong>Nombre:</strong> {{ detalle?.nombre }}</div>
              <div><strong>Legajo:</strong> {{ detalle?.legajo }}</div>
              <div><strong>Área:</strong> {{ detalle?.area }}</div>
              <div><strong>Fecha de ingreso:</strong> {{ detalle?.fecha?.toDate?.().toLocaleDateString() || '-' }}</div>
              <div><strong>Usuario:</strong> {{ detalle?.usuario || '-' }}</div>
            </div>
            <div class="col-6">
              <div class="text-h6">Retiró</div>
              <div><strong>Nombre:</strong> {{ detalle?.nombreRetira }}</div>
              <div><strong>Legajo:</strong> {{ detalle?.legajoRetira }}</div>
              <div><strong>Área:</strong> {{ detalle?.areaRetira }}</div>
              <div><strong>Fecha de retiro:</strong> {{ detalle?.fechaRetiro?.toDate?.().toLocaleDateString() || '-' }}</div>
              <div><strong>Usuario:</strong> {{ detalle?.usuarioRetiro || '-' }}</div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup @click="modalOpen = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import jsPDF from 'jspdf'

const rows = ref([])
const loading = ref(true)
const modalOpen = ref(false)
const detalle = ref(null)

const columns = [
  { name: 'tipoEquipo', label: 'Tipo de equipo', field: 'tipoEquipo', align: 'left' },
  { name: 'modelo', label: 'Modelo', field: 'modelo', align: 'left' },
  { name: 'numeroSerie', label: 'N° de Serie', field: 'numeroSerie', align: 'left' },
  {
    name: 'fecha',
    label: 'Fecha de Ingreso',
    field: row => row.fecha?.toDate?.().toLocaleDateString() || '',
    align: 'left'
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  { name: 'actions', label: 'Acciones', align: 'center' }
]

const pagination = ref({ page: 1, rowsPerPage: 10 })

const fetchData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'stock'))
    let data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    data = data.filter(item => item.estado === 'resuelto')

    data.sort((a, b) => {
      const fechaA = a.fecha?.seconds ?? 0
      const fechaB = b.fecha?.seconds ?? 0
      return fechaB - fechaA
    })

    rows.value = data
  } catch (error) {
    console.error('Error al obtener datos:', error)
  } finally {
    loading.value = false
  }
}

const exportarPDF = (row) => {
  const doc = new jsPDF()
  const fecha = row.fecha?.toDate?.().toLocaleDateString() || 'Sin fecha'
  const usuario = row.usuario || 'No especificado'

  // Título
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Registro de Movimiento de Stock', 105, 20, { align: 'center' })

  // Fecha
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Fecha de emisión: ${fecha}`, 20, 35)

  // Línea separadora
  doc.setDrawColor(0)
  doc.line(20, 40, 190, 40)

  // Datos del registro
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
  agregarDato('Usuario', usuario)
  agregarDato('Retira', row.nombreRetira)
  agregarDato('Legajo Retira', row.legajoRetira)
  agregarDato('Área Retira', row.areaRetira)
  agregarDato('Fecha Retiro', row.fechaRetiro?.toDate?.().toLocaleDateString() || '-')
  agregarDato('Registro', row.usuarioRetiro)

  // Firma
  y += 100
  doc.setFont('helvetica', 'normal')
  doc.text('Firma: ________________________________', 20, y)
  y += 10
  doc.text('Aclaración: ___________________________', 20, y)

  doc.save(`registro-${row.legajo || row.id}.pdf`)
}

function abrirModal(row) {
  detalle.value = row
  modalOpen.value = true
}

onMounted(fetchData)
</script>
