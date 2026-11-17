<script setup lang="ts">
/**
 * `/pedir-cita` ya no es una página: el formulario vive en Contacto (`/contacto#cita`). Se conserva la ruta
 * para no romper enlaces antiguos, y se mantiene `?motivo=` para preseleccionar el motivo.
 */
definePageMeta({
  redirect: (to) => ({ path: '/contacto', query: to.query, hash: '#cita' }),
})
</script>

<template>
  <div />
</template>
