<script setup lang="ts">
/**
 * Valores (spec 03 §3): cuatro bloques horizontales (no tarjetas) con icono lineal propio, título y texto,
 * separados por líneas finas que se "dibujan" al entrar.
 * Escritorio 4 col · tablet 2×2 · 481–767 2 col · ≤ 480 1 col.
 */
import { site } from '~/data/site'
import { values } from '~/data/values'

const clinic = useClinic()
const titleFor = (title: string) => title.replace('{years}', String(clinic.years))
</script>

<template>
  <section class="bg-white py-(--space-section)" aria-labelledby="valores-title">
    <div class="container-site">
      <!-- La spec 03 §3 no define titular visible para los valores -->
      <h2 id="valores-title" class="sr-only">Nuestros valores</h2>
      <ul class="values-grid" role="list">
        <li v-for="(value, i) in values" :key="value.id" v-reveal="i" class="value">
          <span class="value-line" aria-hidden="true" />
          <svg
            class="size-11 text-primary"
            viewBox="0 0 44 44"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <template v-if="value.id === 'years'">
              <path d="M22 6a16 16 0 1 1-15.2 11" />
              <path d="M6.8 17 5 10.5" stroke="var(--color-cyan)" />
              <path d="M22 13v9l6 4" />
            </template>
            <template v-else-if="value.id === 'care'">
              <path d="M22 36s-13-7.4-13-17a7 7 0 0 1 13-3.6A7 7 0 0 1 35 19c0 9.6-13 17-13 17Z" />
              <path d="M15 20h4l2-4 3 8 2-4h3" stroke="var(--color-cyan)" />
            </template>
            <template v-else-if="value.id === 'technology'">
              <rect x="8" y="10" width="28" height="22" rx="5" />
              <circle cx="18" cy="21" r="3.5" stroke="var(--color-cyan)" />
              <circle cx="27" cy="18" r="2" stroke="var(--color-cyan)" />
              <circle cx="27" cy="25" r="2" stroke="var(--color-cyan)" />
              <path d="M16 36h12" />
            </template>
            <template v-else>
              <path d="M22 38s-11-9.3-11-18a11 11 0 0 1 22 0c0 8.7-11 18-11 18Z" />
              <circle cx="22" cy="20" r="4" stroke="var(--color-cyan)" />
            </template>
          </svg>
          <h3 class="mt-5 text-heading-s font-semibold text-deep-blue">
            <ContentValue v-if="value.id === 'years'" :value="site.foundedYear">{{
              titleFor(value.title)
            }}</ContentValue>
            <template v-else>{{ value.title }}</template>
          </h3>
          <ContentValue :value="value.text" as="p" class="mt-2 max-w-[32ch] text-text-secondary" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.values-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}
.value {
  position: relative;
  padding: 2rem 0;
}
/* Separador: horizontal arriba (apilado) o vertical a la izquierda (en fila) */
.value-line {
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  background: var(--color-border);
  transform-origin: left;
}
[data-rv] > .value-line {
  transition: transform 900ms var(--ease-out-soft) 150ms;
}
[data-rv='out'] > .value-line {
  transform: scaleX(0);
}

@media (min-width: 481px) {
  .values-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 2rem;
  }
}
@media (min-width: 1024px) {
  .values-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    column-gap: 0;
  }
  .value {
    padding: 0.5rem 2rem 0.5rem 2rem;
  }
  .value:first-child {
    padding-left: 0;
  }
  .value-line {
    inset: 0 auto 0 0;
    width: 1px;
    height: auto;
    transform-origin: top;
  }
  .value:first-child .value-line {
    display: none;
  }
  [data-rv='out'] > .value-line {
    transform: scaleY(0);
  }
}
</style>
