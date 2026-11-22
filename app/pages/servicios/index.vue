<script setup lang="ts">
/**
 * Índice de servicios: la misma cabecera que el resto de páginas (`ClinicHero`: vídeo a sangre con la foto de póster, migas de
 * pan, título y entradilla, sin botón: pedir cita está en la navbar y en el cierre) y el catálogo de los cinco
 * servicios, sin numerar. El cierre «Pedir cita» lo pinta el layout (CtaBlock).
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
      :photo="{ src: '/images/clinic/contacto.jpg', alt: '' }"
      focus="50% 60%"
    >
      <template #crumbs>
        <SiteBreadcrumbs light :items="[{ name: 'Inicio', to: '/' }, { name: 'Servicios' }]" />
      </template>
      <p>Estudio de la pisada, plantillas a medida, uñas y piel, pie infantil y pie diabético.</p>
    </ClinicHero>

    <section aria-label="Los cinco servicios" data-nav-theme="bone">
      <ServiceCatalog />
    </section>
  </div>
</template>
