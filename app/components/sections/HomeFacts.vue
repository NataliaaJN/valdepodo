<script setup lang="ts">
/**
 * Datos de la clínica bajo el hero: una banda fina en cyan de marca con cuatro datos en línea (icono de línea +
 * texto). Hace de bisagra de color entre el hero hueso y Servicios (tinta). El contenido son los `values`.
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

/** «Trato cercano» tal cual; «{years} años de experiencia» → «de experiencia» tras «N años» (ContentValue). */
const items = computed(() =>
  values.map((v) => ({
    id: v.id,
    rest: v.title.startsWith('{years}') ? v.title.split(' ').slice(2).join(' ') : v.title,
  })),
)
</script>

<template>
  <section class="facts relative" data-nav-theme="blue" aria-labelledby="datos-title">
    <h2 id="datos-title" class="sr-only">Valdepodo en datos</h2>
    <div class="container-wide">
      <ul class="facts__list" role="list">
        <li v-for="item in items" :key="item.id" class="fact">
          <BaseIcon :name="icons[item.id]" class="fact__icon" aria-hidden="true" />
          <span>
            <template v-if="item.id === 'years'">
              <ContentValue :value="site.foundedYear" as="span">{{ clinic.years }}</ContentValue> años
            </template>
            {{ item.rest }}
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.facts {
  z-index: 2;
  background: var(--color-primary);
  color: var(--color-ink);
}
.facts__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.875rem 1.5rem;
  padding-block: 1.25rem;
}
.fact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.25;
}
.fact__icon {
  flex: none;
  width: 1.5rem;
  height: 1.5rem;
}

@media (min-width: 1024px) {
  .facts__list {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    padding-block: 1.5rem;
  }
  .fact {
    font-size: 1rem;
  }
}
</style>
