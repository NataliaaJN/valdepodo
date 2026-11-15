<script setup lang="ts">
/**
 * Estudio biomecánico (spec 04 §1): misma cabecera y declaración introductoria que el resto de páginas de
 * servicio y, debajo, «El paseo» (BiomechWalk): capítulo fijado en el que el scroll recorre las seis fases a
 * través de huellas con su mapa de presión. Servicios relacionados al cierre. Textos clínicos en `pending`.
 */
const service = useServicePage('estudio-biomecanico')
const description = service.description
const intro =
  'El estudio biomecánico analiza cómo son tus pies, cómo reparten el apoyo cuando estás de pie y cómo se mueven las articulaciones al caminar o correr. Con esa información detectamos alteraciones de la pisada y valoramos si te conviene algún tratamiento, como unas plantillas hechas a tu medida. Te lo explicamos con calma y sin tecnicismos.'
</script>

<template>
  <div>
    <ServiceHero :service="service" :description="description" />

    <ServiceOverview :service="service" title="Entender tu pisada" :intro="intro" />

    <!-- «El paseo»: capítulo fijado; el scroll recorre las seis fases a través de las huellas -->
    <BiomechWalk />

    <RelatedServices :current="service.slug" />
  </div>
</template>
