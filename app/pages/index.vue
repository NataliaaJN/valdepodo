<script setup lang="ts">
/**
 * Home: hero azul con el claim y el pie 3D, pausa de datos, servicios (fotografía), manifiesto + método,
 * reseñas (solo si hay reales) y cierre «Da el próximo paso.».
 */
import { resolveValue } from '#shared/utils/pending'
import { site } from '~/data/site'

const city = resolveValue(site.city)

usePageSeo({
  title: `Clínica de podología en ${city}`,
  description: `Valdepodo, clínica de podología en ${city}: estudio biomecánico, plantillas personalizadas, podología general, infantil y pie diabético.`,
  path: '/',
})
// La plantilla de títulos añadiría "· Valdepodo" al final: aquí la marca va delante (spec 03 SEO)
useHead({ titleTemplate: `Valdepodo · Clínica de podología en ${city}` })
</script>

<template>
  <div class="-mt-(--nav-h)">
    <!-- El hero queda bajo la navbar: el margen negativo va fuera del elemento que GSAP fija (pin-spacer) -->
    <HomeHero />
    <HomeFacts />
    <HomeServices />
    <HomeMethod />
    <ReviewsSection />
    <CtaBlock :cta="{ label: site.cta.label, to: site.cta.to }" />
  </div>
</template>
