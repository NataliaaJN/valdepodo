<script setup lang="ts">
/**
 * Servicios de la Home: capítulo de tinta con los cinco servicios como piezas fotográficas. Solo el título
 * «Servicios»: sin subtítulo, sin numeración; manda la imagen.
 */
import { servicesSection } from '~/features/home/data/home'
</script>

<template>
  <section
    :id="servicesSection.id"
    class="services chapter-ink section-clip relative"
    data-nav-theme="ink"
    aria-labelledby="servicios-title"
  >
    <div class="container-wide">
      <h2 id="servicios-title" v-reveal class="text-display-l text-bone">Servicios</h2>
      <ServiceTiles class="services__tiles" />
    </div>
  </section>
</template>

<style scoped>
.services {
  padding-block: clamp(3rem, 5vw, 4.5rem);
  scroll-margin-top: calc(var(--nav-h-compact) + 8px);
}
.services__tiles {
  margin-top: clamp(1.5rem, 3vw, 2.5rem);
}
</style>
