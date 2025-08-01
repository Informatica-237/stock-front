<template>
  <q-layout view="hHh lpR fFf">

    <!-- Navbar -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <!-- Botón menú para abrir/cerrar drawer -->
        <q-btn flat dense round icon="menu" @click="drawer = !drawer" />

        <q-toolbar-title>
          📦 Sistema de Stock
        </q-toolbar-title>

        <div class="q-mr-md">
          👤 {{ usuario }}
        </div>

        <q-btn
          flat
          dense
          icon="logout"
          label="Cerrar sesión"
          color="white"
          @click="$emit('logout')"
        />
      </q-toolbar>
    </q-header>

    <!-- Drawer lateral -->
    <q-drawer v-model="drawer" show-if-above side="left" bordered>
      <q-list>
        <q-item clickable v-ripple @click="paginaActual = 'buscar'">
          <q-item-section avatar><q-icon name="search" /></q-item-section>
          <q-item-section>Buscar</q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="paginaActual = 'registro-entrada'">
          <q-item-section avatar><q-icon name="receipt_long" /></q-item-section>
          <q-item-section>Registro - Entra</q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="paginaActual = 'registro-salida'">
          <q-item-section avatar><q-icon name="receipt_long" /></q-item-section>
          <q-item-section>Registro - Salida</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Contenedor de página que cambia según la sección -->
    <q-page-container class="q-pa-md">
      <component :is="paginaSeleccionada" />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import BuscarPage from './secciones/BuscarPage.vue'
import RegistroEntra from './secciones/RegistroEntra.vue'
import RegistroSalida from './secciones/RegistroSalida.vue'

defineProps({
  usuario: String
})

const drawer = ref(true)
const paginaActual = ref('buscar') // Valor inicial coincide con menú

const paginaSeleccionada = computed(() => {
  switch (paginaActual.value) {
    case 'buscar':
      return BuscarPage
    case 'registro-entrada':
      return RegistroEntra
    case 'registro-salida':
      return RegistroSalida
    default:
      return BuscarPage
  }
})
</script>
