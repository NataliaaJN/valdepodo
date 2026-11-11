<script setup lang="ts">
/**
 * Servicios de la Home: capítulo de tinta con los cinco servicios como piezas fotográficas, sin descripciones.
 * Cabecera mínima (índice + titular) para que mande la imagen.
 */
import { servicesSection } from '~/data/home'
import { services } from '~/data/services'

const headline = `${servicesSection.title.before}${servicesSection.title.accent}${servicesSection.title.after ?? ''}`
</script>

<template>
  <section
    :id="servicesSection.id"
    class="chapter-ink section-clip relative py-(--space-section)"
    data-nav-theme="ink"
    aria-labelledby="servicios-title"
  >
    <div class="container-wide">
      <header class="grid items-end gap-6 pb-14 lg:grid-cols-12 lg:pb-20">
        <p v-reveal class="eyebrow text-ice-blue lg:col-span-3">
          Servicios <span class="tabular-nums">({{ String(services.length).padStart(2, '0') }})</span>
        </p>
        <h2 id="servicios-title" v-reveal class="max-w-[17ch] text-display-l text-bone lg:col-span-9">
          {{ headline }}
        </h2>
      </header>

      <ServiceTiles />
    </div>
  </section>
</template>
