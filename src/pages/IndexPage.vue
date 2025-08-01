<template>
  <div>
    <!-- Login Page -->
    <q-page v-if="!logueado" class="flex flex-center q-pa-xl">
      <q-card class="q-pa-lg shadow-2" style="width: 100%; max-width: 350px">
        <q-card-section>
          <div class="text-h5 text-primary text-center">Iniciar sesión</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input filled v-model="usuario" label="Usuario" dense />
          <q-input filled v-model="contraseña" label="Contraseña" type="password" dense />
        </q-card-section>

        <q-card-actions align="center">
          <q-btn label="Ingresar" color="primary" @click="login" unelevated />
        </q-card-actions>

        <q-card-section v-if="error">
          <q-banner class="bg-red-2 text-red q-pa-sm">
            {{ error }}
          </q-banner>
        </q-card-section>
      </q-card>
    </q-page>

    <!-- Stock Page -->
    <q-page v-else class="q-pa-md">
<stock-view :usuario="usuario" @logout="logout" />
    </q-page>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import StockView from 'src/pages/StockView.vue'

const usuario = ref('')
const contraseña = ref('')
const logueado = ref(false)
const error = ref('')

const login = async () => {
  error.value = ''
  try {
    const q = query(
      collection(db, 'usuarios'),
      where('usuario', '==', usuario.value),
      where('contraseña', '==', contraseña.value)
    )
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      logueado.value = true
    } else {
      error.value = 'Usuario o contraseña incorrectos.'
    }
  } catch (err) {
    error.value = 'Error al iniciar sesión.'
    console.error(err)
  }
}

const logout = () => {
  logueado.value = false
  usuario.value = ''
  contraseña.value = ''
}
</script>
