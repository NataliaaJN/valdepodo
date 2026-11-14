<script setup lang="ts">
/**
 * Datos de la clínica, FUERA del hero: una cápsula de vidrio (glassmorphism) con cuatro elementos en línea,
 * icono de línea azul + texto corto en dos líneas, todo con el mismo peso y tamaño, sin tarjetas.
 * El borde con el hero se funde con una capa propia de esta sección (`::before`); el hero no se toca. El contenido son los `values`.
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
  <section class="facts relative" data-nav-theme="bone" aria-labelledby="datos-title">
    <h2 id="datos-title" class="sr-only">Valdepodo en datos</h2>
    <div class="container-wide">
      <ul class="facts__capsule" role="list">
        <li v-for="(item, i) in items" :key="item.id" v-reveal="i" class="fact">
          <BaseIcon :name="icons[item.id]" class="fact__icon" aria-hidden="true" />
          <span class="fact__text">
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
  /* Banda plana de cyan muy claro: sin vidrio, sin sombras. El corte con el hero es recto */
  background: var(--color-cyan-mist);
  border-bottom: 1px solid var(--color-border);
}
.facts__capsule {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.fact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  color: var(--color-ink);
  border-top: 1px solid var(--color-border);
}
.fact:nth-child(-n + 2) {
  border-top: 0;
}
.fact:nth-child(even) {
  border-left: 1px solid var(--color-border);
}
.fact__icon {
  flex: none;
  width: 1.75rem;
  height: 1.75rem;
  color: var(--color-primary-strong);
}
.fact__text {
  max-width: 11rem;
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.25;
}

@media (min-width: 1024px) {
  .facts__capsule {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .fact,
  .fact:nth-child(-n + 2),
  .fact:nth-child(even) {
    border-top: 0;
    border-left: 1px solid var(--color-border);
    padding: 1.75rem 2rem;
    gap: 0.875rem;
  }
  .fact:first-child {
    border-left: 0;
  }
  .fact__icon {
    width: 2rem;
    height: 2rem;
  }
}
</style>
