<template>
  <div class="q-pa-md" style="max-width: 600px; margin: auto;">
    <h3>🔍 Buscar</h3>

    <q-input
      filled
      v-model="terminoBusqueda"
      label="Buscar por nombre, legajo o modelo"
      clearable
      debounce="300"
      @clear="() => { terminoBusqueda = ''; buscar() }"
      prepend-icon="search"
      class="q-mb-md"
    />

    <div v-if="terminoBusqueda && resultados.length === 0">
      <q-banner class="bg-grey-3 text-grey-9">No se encontraron resultados.</q-banner>
    </div>

<q-list v-else>
  <q-item v-for="item in resultados" :key="item.id" clickable @click="abrirModal(item)">
    <q-item-section>
      <div class="text-bold">📦 {{ item.nombre }}</div>
      <div>Legajo: {{ item.legajo }}</div>
      <div>Modelo: {{ item.modelo }}</div>
    </q-item-section>
  </q-item>
</q-list>


    <!-- Modal edición -->
    <q-dialog v-model="modalOpen" persistent>
      <q-card style="min-width: 350px; max-width: 500px;">
        <q-card-section>
          <div class="text-h6">Editar Estado</div>
          <div><strong>Nombre:</strong> {{ itemSeleccionado?.nombre }}</div>
          <div><strong>Legajo:</strong> {{ itemSeleccionado?.legajo }}</div>
          <div><strong>Modelo:</strong> {{ itemSeleccionado?.modelo }}</div>
          <div><strong>Número de Serie:</strong> {{ itemSeleccionado?.numeroSerie }}</div>
          <div class="q-mt-md">
            <q-select
              v-model="nuevoEstado"
              :options="['sin resolver', 'resuelto']"
              label="Estado"
              dense
              filled
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup @click="modalOpen = false" />
          <q-btn flat label="Guardar" color="primary" @click="confirmarCambioEstado" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal confirmación -->
    <q-dialog v-model="modalConfirmacion" persistent>
      <q-card class="bg-positive text-white">
        <q-card-section class="row items-center">
          <q-icon name="check_circle" size="md" class="q-mr-sm" />
          <div>✅ Estado actualizado con éxito</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="white" v-close-popup @click="modalConfirmacion = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from 'boot/firebase'

const terminoBusqueda = ref('')
const resultados = ref([])
const datosStock = ref([])

const modalOpen = ref(false)
const modalConfirmacion = ref(false)

const itemSeleccionado = ref(null)
const nuevoEstado = ref('sin resolver')

async function cargarDatos() {
  try {
    const querySnapshot = await getDocs(collection(db, 'stock'))
    datosStock.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0))
    resultados.value = datosStock.value.slice(0, 7)
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
}

function buscar() {
  const termino = terminoBusqueda.value.toLowerCase().trim()
  if (!termino) {
    resultados.value = datosStock.value.slice(0, 7)
    return
  }
  resultados.value = datosStock.value.filter(item => {
    return (
      (item.nombre?.toLowerCase().includes(termino)) ||
      (item.legajo?.toLowerCase().includes(termino)) ||
      (item.modelo?.toLowerCase().includes(termino))
    )
  }).slice(0, 7)
}

function abrirModal(item) {
  itemSeleccionado.value = { ...item }
  nuevoEstado.value = item.estado || 'sin resolver'
  modalOpen.value = true
}

async function confirmarCambioEstado() {
  if (!itemSeleccionado.value) return
  try {
    const docRef = doc(db, 'stock', itemSeleccionado.value.id)
    await updateDoc(docRef, { estado: nuevoEstado.value })
    // Actualizar localmente
    const index = datosStock.value.findIndex(i => i.id === itemSeleccionado.value.id)
    if (index !== -1) {
      datosStock.value[index].estado = nuevoEstado.value
    }
    buscar() // actualizar resultados visibles

    modalOpen.value = false
    modalConfirmacion.value = true
  } catch (error) {
    console.error('Error actualizando estado:', error)
  }
}

watch(terminoBusqueda, () => {
  buscar()
})

cargarDatos()
</script>
