<script setup lang="ts">
/**
 * Estudio biomecánico (spec 04 §1): misma cabecera y declaración introductoria que el resto de páginas de
 * servicio y, debajo, «El paseo» (BiomechWalk): capítulo fijado en el que el scroll recorre las seis fases a
 * través de huellas con su mapa de presión. Servicios relacionados al cierre. Textos clínicos en `pending`.
 */
import { pending } from '#shared/utils/pending'

const service = useServicePage('estudio-biomecanico')
const description = service.description
const intro = pending(
  '[Qué es el estudio biomecánico y qué permite analizar: texto pendiente de validar]',
  'Introducción del servicio (spec 04 §1.2): la redacta o valida la clínica',
)
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
