<script setup lang="ts">
/** Política de privacidad (RGPD). Borrador estructural en `pending()` hasta la revisión de la asesoría. */
import { privacyPolicy } from '~/data/legal'
</script>

<template>
  <LegalDocument :page="privacyPolicy" path="/privacidad" />
</template>
