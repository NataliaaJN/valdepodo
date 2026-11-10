<script setup lang="ts">
/**
 * Fila editorial de tratamiento (spec 04 §3).
 * - ≥ 1024 con puntero fino: numeral en contorno · nombre · descripción · ilustración que aparece en hover
 *   dentro de una máscara orgánica y sigue ligeramente al cursor (≤ 20 px) · enlace "Pedir cita".
 * - Táctil o < 1024: ilustración, descripción y enlace siempre visibles (sin acordeón).
 */
import type { Treatment } from '~/data/treatments'

defineProps<{ treatment: Treatment; to: string }>()

const row = ref<HTMLElement | null>(null)
const offset = ref({ x: 0, y: 0 })

function onPointerMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || !row.value) return
  const r = row.value.getBoundingClientRect()
  const nx = (e.clientX - r.left) / r.width - 0.5
  const ny = (e.clientY - r.top) / r.height - 0.5
  offset.value = { x: Math.round(nx * 40), y: Math.round(ny * 40) }
}
</script>

<template>
  <li
    ref="row"
    class="treatment-row"
    :style="{ '--mx': `${offset.x}px`, '--my': `${offset.y}px` }"
    @pointermove="onPointerMove"
    @pointerleave="offset = { x: 0, y: 0 }"
  >
    <span class="row-number font-display" aria-hidden="true">{{ treatment.number }}</span>
    <div class="row-main">
      <h3 class="font-display text-display-m text-deep-blue">
        <span class="sr-only">{{ treatment.number }}. </span>{{ treatment.name }}
      </h3>
      <ContentValue :value="treatment.subtitle" as="p" class="eyebrow mt-2 text-primary-strong" />
    </div>
    <div class="row-text">
      <ContentValue :value="treatment.description" as="p" class="text-text-secondary" />
      <NuxtLink :to="to" class="row-link">
        Pedir cita <span class="sr-only">para {{ treatment.name.toLowerCase() }}</span>
        <BaseIcon name="arrow-right" class="size-4" />
      </NuxtLink>
    </div>
    <div class="row-illustration" aria-hidden="true">
      <div class="row-mask">
        <TreatmentIllustration :kind="treatment.illustration" />
      </div>
    </div>
  </li>
</template>

<style scoped>
.treatment-row {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  border-bottom: 1px solid var(--color-border);
  padding: 2rem 0;
}
.row-number {
  font-size: clamp(3rem, 2rem + 4vw, 5.5rem);
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1.25px var(--color-primary);
}
.row-link {
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-primary-strong);
  text-decoration: underline;
  text-underline-offset: 5px;
}
/* La fila no es un enlace: el único enlace real es "Pedir cita" */
.row-illustration {
  width: min(70%, 220px);
  aspect-ratio: 200 / 170;
}
.row-mask {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-organic);
  background: var(--color-light-blue);
  padding: 8%;
}

@media (min-width: 768px) {
  .treatment-row {
    grid-template-columns: 7rem minmax(0, 1fr) 11rem;
    grid-template-areas:
      'num main ill'
      'num text ill';
    column-gap: 2rem;
  }
  .row-number {
    grid-area: num;
  }
  .row-main {
    grid-area: main;
  }
  .row-text {
    grid-area: text;
  }
  .row-illustration {
    grid-area: ill;
    width: 100%;
    align-self: center;
  }
}

@media (min-width: 1024px) {
  .treatment-row {
    grid-template-columns: 9rem minmax(0, 1.1fr) minmax(0, 1fr) 13rem;
    grid-template-areas: 'num main text ill';
    align-items: center;
    padding: 2.5rem 1.5rem;
    margin-inline: -1.5rem;
    border-radius: var(--radius-m);
    transition: background-color var(--dur-base) var(--ease-out-soft);
  }
  .row-number {
    transition: transform var(--dur-base) var(--ease-out-soft);
  }
}

/* Hover solo con puntero fino en escritorio: la ilustración se revela */
@media (min-width: 1024px) and (hover: hover) and (pointer: fine) {
  .row-illustration {
    opacity: 0;
    transform: translate(var(--mx), var(--my)) scale(0.9);
    transition:
      opacity var(--dur-base) var(--ease-out-soft),
      transform 500ms var(--ease-out-soft);
  }
  .treatment-row:hover,
  .treatment-row:focus-within {
    background: var(--color-light-blue);
  }
  .treatment-row:hover .row-number,
  .treatment-row:focus-within .row-number {
    transform: translateX(12px);
  }
  .treatment-row:hover .row-illustration,
  .treatment-row:focus-within .row-illustration {
    opacity: 1;
    transform: translate(var(--mx), var(--my)) scale(1);
  }
  .treatment-row:hover .row-mask {
    background: var(--color-white);
  }
}

@media (prefers-reduced-motion: reduce) {
  .row-illustration,
  .row-number {
    transition: opacity 150ms linear !important;
    transform: none !important;
  }
}
</style>
