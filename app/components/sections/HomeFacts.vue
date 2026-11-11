<script setup lang="ts">
/**
 * Pausa de datos bajo el hero: una franja de aire con cuatro micro-tarjetas de vidrio muy sutil que
 * cabalgan la costura entre el azul del hero y el hueso (es lo que da sentido al vidrio: tiene algo detrás).
 * Datos que ya existen en la web (`values`): años de experiencia, trato, tecnología y ubicación.
 * No es un panel de estadísticas: una cifra solo (los años), el resto son palabras.
 */
import { site } from '~/data/site'
import { values } from '~/data/values'

const clinic = useClinic()
const titleFor = (title: string) => title.replace('{years}', String(clinic.years))
</script>

<template>
  <section class="facts relative" data-nav-theme="bone" aria-labelledby="datos-title">
    <h2 id="datos-title" class="sr-only">Valdepodo en datos</h2>
    <div class="container-wide">
      <ul class="facts__row" role="list">
        <li
          v-for="(value, i) in values"
          :key="value.id"
          v-reveal="i"
          class="fact glass"
          :class="`fact--${i + 1}`"
        >
          <span class="eyebrow fact__idx">0{{ i + 1 }}</span>
          <template v-if="value.id === 'years'">
            <ContentValue :value="site.foundedYear" as="span" class="fact__num">{{
              clinic.years
            }}</ContentValue>
            <span class="fact__label">años de experiencia</span>
          </template>
          <template v-else>
            <span class="fact__title">{{ titleFor(value.title) }}</span>
          </template>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* Costura: la mitad superior continúa el azul del hero; la inferior es papel. Corte seco, no degradado. */
.facts {
  background: linear-gradient(to bottom, var(--color-primary) 0 50%, var(--color-surface) 50% 100%);
  padding-block: clamp(2rem, 4vw, 3.5rem) clamp(5rem, 9vw, 9rem);
  margin-top: -1px;
}
.facts__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(0.5rem, 1vw, 1rem);
}
.fact {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  min-height: 9.5rem;
  border-radius: var(--radius-m);
  padding: 1rem 1.125rem 1.125rem;
  color: var(--color-ink);
}
.fact__idx {
  color: var(--color-ink);
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
}
.fact__num {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(3.5rem, 2.4rem + 3.6vw, 5.5rem);
  line-height: 0.8;
  letter-spacing: -0.03em;
  font-stretch: 75%;
}
.fact__label {
  font-size: 0.9375rem;
  font-weight: 500;
  margin-top: -1rem;
}
.fact__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.25rem, 1rem + 0.9vw, 1.75rem);
  line-height: 1;
  letter-spacing: -0.03em;
  max-width: 11ch;
}

@media (min-width: 1024px) {
  .facts__row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  /* Ligero desfase vertical: ritmo, no hilera de dashboard */
  .fact--2 {
    margin-top: 1.5rem;
  }
  .fact--4 {
    margin-top: 0.75rem;
  }
}
</style>
