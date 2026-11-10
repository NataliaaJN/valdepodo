<script setup lang="ts">
/**
 * Home · propuesta visual (Fase 5, spec 03): hero con el pie anatómico y fragmento de servicios.
 * Valores, reseñas y CTA final llegan en la Fase 6.
 */
import { resolveValue } from '#shared/utils/pending'
import { site } from '~/data/site'

useSeoMeta({
  title: () => `Clínica de podología en ${resolveValue(site.city)}`,
  description: () =>
    `Valdepodo, clínica de podología en ${resolveValue(site.city)}: estudio biomecánico, plantillas personalizadas, podología general, infantil y pie diabético.`,
  // Propuesta visual: no se indexa hasta la validación de contenidos (Fase 8)
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div>
    <HomeHero />
    <HomeServices />
  </div>
</template>
