<script setup lang="ts">
/**
 * Home: hero azul con el claim y el pie 3D, pausa de datos, servicios (fotografía),
 * reseñas (solo si hay reales) y cierre «Da el próximo paso.».
 */
import { resolveValue } from '#shared/utils/pending'
import { site } from '~/data/site'

const city = resolveValue(site.city)

usePageSeo({
  // Título absoluto: «podólogo en {ciudad}» + tipo de negocio + marca
  title: `Podólogos en ${city} · Clínica de podología Valdepodo`,
  brand: false,
  description: `Valdepodo, clínica de podología en ${city}: estudio biomecánico, plantillas personalizadas, podología general, infantil y pie diabético.`,
  path: '/',
})
</script>

<template>
  <div class="-mt-(--nav-h)">
    <!-- El hero queda bajo la navbar: el margen negativo va fuera del elemento que GSAP fija (pin-spacer) -->
    <HomeHero />
    <HomeFacts />
    <HomeServices />
    <ReviewsSection />
  </div>
</template>
