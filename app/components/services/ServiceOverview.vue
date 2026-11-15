<script setup lang="ts">
/**
 * Primera sección de toda página de servicio, tras la cabecera: la frase del servicio como título, su
 * entradilla, el «Te ayuda si…» (`service.needs`, spec 04 §0) y, si la página lo tiene, su recurso visual
 * (mapa de presión, plantilla, huellas…) con su rótulo. Misma estructura en las cinco páginas.
 */
import type { Maybe } from '#shared/utils/pending'
import type { Service } from '~/data/services'

defineProps<{ service: Service; title: string; intro?: Maybe<string> }>()
defineSlots<{ default?: () => unknown; caption?: () => unknown }>()
</script>

<template>
  <ServiceSection :id="`${service.slug}-overview`" :title="title" :intro="intro" tone="bone">
    <div class="overview" :class="{ 'overview--visual': $slots.default }">
      <div v-reveal class="needs">
        <p class="eyebrow needs__title">Te ayuda si…</p>
        <ul role="list">
          <li v-for="(need, i) in service.needs" :key="i" class="needs__item">
            <ContentValue :value="need" />
          </li>
        </ul>
      </div>
      <figure v-if="$slots.default" v-reveal="1" class="overview__visual">
        <slot />
        <figcaption v-if="$slots.caption" class="overview__caption"><slot name="caption" /></figcaption>
      </figure>
    </div>
  </ServiceSection>
</template>

<style scoped>
.overview {
  display: grid;
  gap: 2rem;
}
.needs__title {
  color: var(--color-text-secondary);
}
.needs ul {
  margin-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}
.needs__item {
  border-bottom: 1px solid var(--color-border);
  padding-block: 1rem;
  font-size: var(--text-body-l);
  line-height: var(--text-body-l--line-height);
  color: var(--color-text);
}
.overview__visual {
  display: grid;
  place-items: center;
  align-self: stretch;
  border-radius: var(--radius-m);
  background: var(--color-bone-2);
  padding: clamp(1.5rem, 3vw, 2.5rem);
}
.overview__visual > :first-child {
  width: 100%;
}
.overview__caption {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}
@media (min-width: 768px) {
  .overview--visual {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    column-gap: 2rem;
    align-items: start;
  }
}
</style>
