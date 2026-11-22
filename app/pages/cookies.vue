<script setup lang="ts">
/** Política de cookies. Borrador en `pending()`; refleja la arquitectura real (sin analítica ni banner). */
import { cookiesPolicy } from '~/features/legal/data/legal'
</script>

<template>
  <LegalDocument :page="cookiesPolicy" path="/cookies" />
</template>
