<script setup lang="ts">
/**
 * Datos de la clínica bajo el hero: cuatro columnas en hielo con filetes. El concepto manda; el icono de línea
 * es pequeño y, en el dato de experiencia, el protagonista es la cifra. El contenido son los `values`.
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

/** «Trato cercano» tal cual; «{years} años de experiencia» → «años de experiencia» (la cifra va aparte). */
const items = computed(() =>
  values.map((v) => ({
    id: v.id,
    label: v.title.startsWith('{years}') ? v.title.split(' ').slice(1).join(' ') : v.title,
  })),
)
</script>

<template>
  <section class="facts relative" data-nav-theme="bone" aria-labelledby="datos-title">
    <h2 id="datos-title" class="sr-only">Valdepodo en datos</h2>
    <div class="container-wide">
      <ul class="facts__list" role="list">
        <li v-for="item in items" :key="item.id" class="fact">
          <ContentValue v-if="item.id === 'years'" :value="site.foundedYear" as="span" class="fact__number">{{
            clinic.years
          }}</ContentValue>
          <BaseIcon v-else :name="icons[item.id]" class="fact__icon" aria-hidden="true" />
          <span class="fact__label">{{ item.label }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.facts {
  z-index: 2;
  background: var(--color-ice);
  color: var(--color-ink);
  border-block: 1px solid rgb(6 26 44 / 0.1);
}
.facts__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.fact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.125rem 1rem;
  border-top: 1px solid rgb(6 26 44 / 0.1);
}
.fact:nth-child(-n + 2) {
  border-top: 0;
}
.fact:nth-child(even) {
  border-left: 1px solid rgb(6 26 44 / 0.1);
}
.fact__icon {
  flex: none;
  width: 1.125rem;
  height: 1.125rem;
  opacity: 0.7;
}
.fact__number {
  font-family: var(--font-display);
  font-weight: 650;
  font-size: 2.25rem;
  line-height: 0.9;
  letter-spacing: -0.04em;
}
.fact__label {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.0625rem;
  line-height: 1.1;
  letter-spacing: -0.015em;
  text-wrap: balance;
}

@media (min-width: 1024px) {
  .facts__list {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .fact,
  .fact:nth-child(-n + 2),
  .fact:nth-child(even) {
    border-top: 0;
    border-left: 1px solid rgb(6 26 44 / 0.1);
    padding: 1.5rem 2rem;
  }
  .fact:first-child {
    border-left: 0;
    padding-left: 0;
  }
  .fact__label {
    font-size: 1.1875rem;
  }
  .fact__number {
    font-size: 2.75rem;
  }
}
</style>
