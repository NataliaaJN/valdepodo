<script setup lang="ts">
/**
 * Laboratorio de experiencias (solo desarrollo / previews con NUXT_PUBLIC_ENABLE_LAB=true).
 * Aquí se desarrollan y validan aisladas las experiencias 3D y gráficas (Fases 2-4).
 */
useSeoMeta({ title: 'Laboratorio', robots: 'noindex, nofollow' })

const NuxtLinkComponent = resolveComponent('NuxtLink')

const experiments = [
  {
    to: '/_lab/sistema',
    title: 'Sistema de diseño',
    status: 'Fase 6',
    text: 'Paleta y contrastes, tipografía, botones, formularios, glass, iconos y reveal.',
  },
  {
    to: '/_lab/escena',
    title: 'Escena de prueba',
    status: 'Fase 1',
    text: 'Cadena Blender → GLB → meshopt → TresJS.',
  },
  { to: '/_lab/pie', title: 'Pie anatómico', status: 'Fase 2', text: 'Prototipo y validación de capas.' },
  {
    to: '/_lab/pie-procedural',
    title: 'Pie procedural',
    status: 'Prueba',
    text: 'Pie 3D estilizado sin modelos externos, en maqueta de hero.',
  },
  {
    to: '/_lab/biomecanico',
    title: 'Estudio biomecánico',
    status: 'Fase 3',
    text: 'Huellas, mapas de presión y marcha (SVG).',
  },
  {
    to: '/_lab/plantilla',
    title: 'Plantilla y fibras',
    status: 'Fase 4',
    text: 'Plantilla paramétrica y fibras instanciadas.',
  },
]
</script>

<template>
  <div class="container-site py-16">
    <p class="eyebrow text-primary-strong">Solo desarrollo</p>
    <h1 class="mt-3 font-display text-display-l text-deep-blue">Laboratorio</h1>
    <ul class="mt-10 grid gap-4 md:grid-cols-2">
      <li v-for="item in experiments" :key="item.title">
        <component
          :is="item.to ? NuxtLinkComponent : 'div'"
          :to="item.to ?? undefined"
          class="block h-full rounded-m border border-border bg-white p-6 shadow-soft transition-colors hover-fine:border-primary"
          :class="{ 'opacity-60': !item.to }"
        >
          <span class="eyebrow text-text-secondary">{{ item.status }}</span>
          <h2 class="mt-2 text-heading-s font-semibold text-deep-blue">{{ item.title }}</h2>
          <p class="mt-1 text-text-secondary">{{ item.text }}</p>
        </component>
      </li>
    </ul>
  </div>
</template>
