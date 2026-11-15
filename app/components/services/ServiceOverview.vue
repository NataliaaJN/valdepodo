<script setup lang="ts">
/**
 * Primera sección de toda página de servicio, tras la cabecera: la frase del servicio como título (columna
 * izquierda) y, en la derecha, su descripción en tipografía grande y, si la página lo tiene, su recurso visual
 * (mapa de presión, plantilla, huellas…) debajo, con su rótulo. Misma estructura en las cinco páginas.
 */
import type { Maybe } from '#shared/utils/pending'
import type { Service } from '~/data/services'

defineProps<{ service: Service; title: string; intro?: Maybe<string> }>()
defineSlots<{ default?: () => unknown; caption?: () => unknown }>()
</script>

<template>
  <ServiceSection :id="`${service.slug}-overview`" :title="title" tone="bone">
    <div class="overview">
      <ContentValue v-if="intro" v-reveal="1" :value="intro" as="p" class="overview__intro" />
      <figure v-if="$slots.default" v-reveal="2" class="overview__visual">
        <slot />
        <figcaption v-if="$slots.caption" class="overview__caption"><slot name="caption" /></figcaption>
      </figure>
    </div>
  </ServiceSection>
</template>

<style scoped>
.overview {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2.5rem);
}
.overview__intro {
  max-width: 40ch;
  font-size: var(--text-body-l);
  line-height: var(--text-body-l--line-height);
  color: var(--color-text);
}
.overview__visual {
  width: 100%;
  max-width: 34rem;
  border-radius: var(--radius-m);
  background: var(--color-bone-2);
  padding: clamp(1.5rem, 3vw, 2.5rem);
}
.overview__caption {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}
</style>
