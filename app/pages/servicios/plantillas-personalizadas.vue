<script setup lang="ts">
/**
 * Plantillas personalizadas (spec 04 §2): misma cabecera y declaración introductoria que el resto de páginas de
 * servicio (solo texto, sin imagen) y, debajo, «Cómo hacemos tus plantillas» (InsoleCraft): capítulo fijado en el
 * que el scroll dibuja el proceso. Servicios relacionados al cierre. Textos clínicos pendientes de validar.
 */
const service = useServicePage('plantillas-personalizadas')
const intro =
  'Una plantilla a medida no se elige de un estante: se diseña a partir de lo que vemos en tu pie y en tu forma de caminar. Partimos del estudio biomecánico, tenemos en cuenta tu actividad, tu calzado y tus molestias, y la ajustamos contigo hasta que resulte cómoda. Después revisamos cómo te adaptas a ella para corregir lo que haga falta.'
</script>

<template>
  <div>
    <ServiceHero :service="service" :description="service.description" />

    <ServiceOverview
      :service="service"
      title="No existen dos pies iguales. Tus plantillas tampoco deberían serlo."
      :intro="intro"
    />

    <!-- Proceso de personalización (spec 04 §2.4): capítulo fijado, el scroll dibuja la plantilla -->
    <InsoleCraft />

    <RelatedServices :current="service.slug" />
  </div>
</template>
