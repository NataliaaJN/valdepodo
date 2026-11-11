<script setup lang="ts">
/**
 * Banda de confianza bajo el hero: cuatro píldoras de vidrio muy sutil (icono + frase corta) que cabalgan la
 * costura entre el azul del hero y el hueso, que es lo que da sentido al vidrio. Datos que ya existen
 * (`values`); sin cifras gigantes, sin numeración y sin párrafos.
 */
import type { IconName } from '~/components/base/BaseIcon.vue'
import { site } from '~/data/site'
import { values, type ValueIcon } from '~/data/values'

const clinic = useClinic()
const icons: Record<ValueIcon, IconName> = {
  years: 'clock',
  care: 'heart',
  technology: 'spark',
  location: 'map-pin',
}
</script>

<template>
  <section class="facts relative" data-nav-theme="bone" aria-labelledby="datos-title">
    <h2 id="datos-title" class="sr-only">Valdepodo en datos</h2>
    <div class="container-wide">
      <ul class="facts__row" role="list">
        <li v-for="(value, i) in values" :key="value.id" v-reveal="i" class="fact glass">
          <BaseIcon :name="icons[value.id]" class="fact__icon" />
          <span class="fact__label">
            <template v-if="value.id === 'years'">
              <ContentValue :value="site.foundedYear" as="span">{{ clinic.years }}</ContentValue> años de
              experiencia
            </template>
            <template v-else>{{ value.title }}</template>
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* Costura: la mitad superior continúa el azul del hero; la inferior es papel. Corte seco, no degradado. */
.facts {
  background: linear-gradient(to bottom, var(--color-primary) 0 50%, var(--color-surface) 50% 100%);
  padding-block: 1rem clamp(3.5rem, 6vw, 6rem);
  margin-top: -1px;
}
.facts__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}
.fact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: var(--radius-m);
  padding: 0.85rem 1rem;
  color: var(--color-ink);
}
.fact__icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-primary-strong);
}
.fact__label {
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.2;
  text-wrap: balance;
}
@media (min-width: 1024px) {
  .facts__row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
  }
  .fact {
    padding: 1rem 1.25rem;
  }
}
</style>
