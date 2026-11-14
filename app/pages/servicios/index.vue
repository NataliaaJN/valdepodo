<script setup lang="ts">
/**
 * Índice de servicios: hero con vídeo (qué se ofrece y «Pedir cita» en la primera pantalla) y cinco filas
 * editoriales, una por servicio. El cierre «Pedir cita» lo pinta el layout (CtaBlock).
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
    <ClinicHero
      id="services-title"
      title="Servicios de podología"
      video="/videos/servicios.mp4"
      :photo="{ src: null, alt: '' }"
    >
      <p>Estudio de la pisada, plantillas a medida, uñas y piel, pie infantil y pie diabético.</p>
      <BaseButton to="/contacto#cita" variant="on-blue" arrow class="mt-6">Pedir cita</BaseButton>
    </ClinicHero>

    <section aria-label="Los cinco servicios" data-nav-theme="bone">
      <ServiceRows />
    </section>
  </div>
</template>
