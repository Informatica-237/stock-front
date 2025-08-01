<template>
  <div class="q-pa-md flex flex-center">
    <div class="q-gutter-md" style="width: 400px;">
      <h3 class="text-center">📥 Registro de Entrada</h3>

      <q-form @submit.prevent="registrarEntrada" class="q-gutter-md">
        <q-input
          filled
          v-model="nombre"
          label="Nombre y Apellido"
          :rules="[val => !!val || 'Campo requerido']"
        />

        <q-input
          filled
          v-model="legajo"
          label="Legajo"
          :rules="[val => !!val || 'Campo requerido']"
        />

        <q-input
          filled
          v-model="modelo"
          label="Modelo de la máquina/equipo"
          :rules="[val => !!val || 'Campo requerido']"
        />

        <q-input
          filled
          v-model="numeroSerie"
          label="Número de Serie"
          :rules="[val => !!val || 'Campo requerido']"
        />

        <q-btn
          type="submit"
          label="Guardar"
          color="primary"
          icon="save"
          class="q-mt-md full-width"
        />
      </q-form>
    </div>

    <!-- Modal de confirmación -->
    <q-dialog v-model="dialogoExito" persistent>
      <q-card class="bg-positive text-white">
        <q-card-section class="row items-center">
          <q-icon name="check_circle" size="md" class="q-mr-sm" />
          <div>Registro guardado con éxito</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const nombre = ref('')
const legajo = ref('')
const modelo = ref('')
const numeroSerie = ref('')
const dialogoExito = ref(false)

const registrarEntrada = async () => {
  try {
    await addDoc(collection(db, 'stock'), {
      nombre: nombre.value,
      legajo: legajo.value,
      modelo: modelo.value,
      numeroSerie: numeroSerie.value,
      fecha: serverTimestamp(),
      tipo: 'entrada',
      estado: 'sin resolver'  // <-- campo nuevo agregado
    })

    // Limpiar formulario
    nombre.value = ''
    legajo.value = ''
    modelo.value = ''
    numeroSerie.value = ''

    // Mostrar modal de éxito
    dialogoExito.value = true

    // Cierra el modal automáticamente después de 3 segundos
    setTimeout(() => {
      dialogoExito.value = false
    }, 3000)

  } catch (error) {
    console.error('❌ Error al guardar:', error)
  }
}
</script>
