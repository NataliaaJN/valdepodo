<script setup lang="ts">
/**
 * Home (spec 03): hero con el pie anatómico, servicios, valores, reseñas (solo si hay reales) y CTA final.
 */
import { pending, resolveValue } from '#shared/utils/pending'
import { site } from '~/data/site'

const city = resolveValue(site.city)

usePageSeo({
  title: `Clínica de podología en ${city}`,
  description: `Valdepodo, clínica de podología en ${city}: estudio biomecánico, plantillas personalizadas, podología general, infantil y pie diabético.`,
  path: '/',
})
// La plantilla de títulos añadiría "· Valdepodo" al final: aquí la marca va delante (spec 03 SEO)
useHead({ titleTemplate: `Valdepodo · Clínica de podología en ${city}` })

const ctaText = pending(
  'Cuéntanos qué necesitas y te ayudamos a dar el siguiente paso.',
  'Texto del CTA final de la Home (spec 03 §5): validar con la clínica',
)
</script>

<template>
  <div>
    <HomeHero />
    <HomeServices />
    <ValuesStrip />
    <ReviewsSection />
    <CtaBlock
      :title="{ before: 'Da el próximo ', accent: 'paso' }"
      :text="ctaText"
      :cta="{ label: site.cta.label, to: site.cta.to }"
    />
  </div>
</template>
