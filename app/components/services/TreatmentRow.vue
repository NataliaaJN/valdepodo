<script setup lang="ts">
/**
 * Fila de tratamiento (spec 04 §3): nombre y subtítulo, descripción e ilustración propia, todo visible desde
 * el principio (antes la ilustración solo aparecía al pasar el cursor y la fila quedaba medio vacía). No es una
 * secuencia, así que sin numeración; sin enlace propio: la acción es la de la cabecera. Hover (puntero fino):
 * la fila se tiñe de cyan muy claro y la ilustración sube 2 px.
 */
import type { Treatment } from '~/data/treatments'

defineProps<{ treatment: Treatment }>()
</script>

<template>
  <li class="treatment">
    <div class="treatment__text">
      <h3 class="treatment__name">{{ treatment.name }}</h3>
      <ContentValue :value="treatment.subtitle" as="p" class="treatment__sub" />
      <ContentValue :value="treatment.description" as="p" class="treatment__desc" />
    </div>
    <div class="treatment__art" aria-hidden="true">
      <TreatmentIllustration :kind="treatment.illustration" />
    </div>
  </li>
</template>

<style scoped>
.treatment {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 7.5rem;
  align-items: center;
  gap: 1.25rem;
  border-bottom: 1px solid var(--color-border);
  padding: 1.5rem 0;
}
.treatment:first-child {
  border-top: 1px solid var(--color-border);
}
.treatment__name {
  font-size: var(--text-heading-s);
  line-height: 1.12;
  color: var(--color-ink);
}
.treatment__sub {
  margin-top: 0.25rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}
.treatment__desc {
  margin-top: 0.75rem;
  max-width: 46ch;
  color: var(--color-text);
}
.treatment__art {
  aspect-ratio: 200 / 170;
  border-radius: var(--radius-m);
  background: var(--color-bone-2);
  padding: 0.5rem;
  transition: translate var(--dur-base) var(--ease-out-soft);
}
@media (min-width: 768px) {
  .treatment {
    grid-template-columns: minmax(0, 1fr) 11rem;
    gap: 2rem;
    padding-block: 2rem;
  }
}
@media (hover: hover) and (pointer: fine) {
  .treatment:hover .treatment__art {
    translate: 0 -2px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .treatment__art {
    transition: none;
  }
}
</style>
