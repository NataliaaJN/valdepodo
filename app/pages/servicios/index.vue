<script setup lang="ts">
/**
 * Índice de servicios: cabecera monumental y un recorrido con scroll por los cinco servicios
 * (línea de tiempo + imagen asociada). Las cards de la Home no se repiten aquí.
 */
usePageSeo({
  title: 'Servicios de podología',
  description:
    'Estudio biomecánico, plantillas personalizadas, podología general, podología infantil y pie diabético en Valdepodo.',
  path: '/servicios',
})
useBreadcrumbSchema([
  { name: 'Inicio', path: '/' },
  { name: 'Servicios', path: '/servicios' },
])
</script>

<template>
  <div>
    <PageHeader id="services-title" title="Servicios" size="l" />

    <section aria-label="Los cinco servicios" data-nav-theme="bone">
      <ServiceScroll />
    </section>
  </div>
</template>
