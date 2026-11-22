<script setup lang="ts">
/**
 * Podología general (spec 04 §3): estructura común de servicio (cabecera · «Te ayuda si…» · secciones) con los
 * cuatro tratamientos en filas editoriales.
 */
import { pending } from '#shared/utils/pending'
import { treatments } from '~/features/services/data/treatments'

const service = useServicePage('podologia-general')

const intro = pending(
  'Muchas molestias del pie tienen solución sencilla si se tratan a tiempo. Te explicamos qué ocurre y cómo evitar que vuelva a pasar.',
  'Introducción de podología general (spec 04 §3): validar con la clínica',
)
</script>

<template>
  <div>
    <ServiceHero :service="service" :description="service.description" />

    <ServiceOverview :service="service" title="Cuidar tus pies también es prevenir." :intro="intro" />

    <ServiceSection id="treatments-title" title="Las molestias más frecuentes" tone="bone-2">
      <ul role="list">
        <TreatmentRow v-for="t in treatments" :key="t.number" v-reveal :treatment="t" />
      </ul>
    </ServiceSection>

    <RelatedServices :current="service.slug" />
  </div>
</template>
