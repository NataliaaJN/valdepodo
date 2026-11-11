<script setup lang="ts">
/**
 * Datos de la clínica, FUERA del hero: una fila minimalista (sin tarjetas) con icono de línea en un círculo
 * suave, título y apoyo, separados por filetes finos. Continúa el cian clarito del hero: el degradado de
 * enlace vive al pie del hero (`.hero__bridge`), y esta sección arranca con ese mismo tono.
 * El contenido son los `values`.
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

/** «Trato cercano» → «Trato» (fuerte) + «cercano» (pequeño). «{years} años de experiencia» → «N años» + «de experiencia». */
function split(title: string): [string, string] {
  const words = title.split(' ')
  const n = title.startsWith('{years}') ? 2 : 1
  return [words.slice(0, n).join(' '), words.slice(n).join(' ')]
}
const items = computed(() =>
  values.map((v) => {
    const [main, sub] = split(v.title)
    return { id: v.id, main, sub }
  }),
)
</script>

<template>
  <section class="facts relative" data-nav-theme="bone" aria-labelledby="datos-title">
    <h2 id="datos-title" class="sr-only">Valdepodo en datos</h2>
    <div class="container-wide">
      <ul class="facts__row" role="list">
        <li v-for="(item, i) in items" :key="item.id" v-reveal="i" class="fact">
          <span class="fact__icon-wrap" aria-hidden="true">
            <BaseIcon :name="icons[item.id]" class="fact__icon" />
          </span>
          <span class="fact__text">
            <span class="fact__main">
              <template v-if="item.id === 'years'">
                <ContentValue :value="site.foundedYear" as="span">{{ clinic.years }}</ContentValue> años
              </template>
              <template v-else>{{ item.main }}</template>
            </span>
            <span class="fact__sub">{{ item.sub }}</span>
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.facts {
  padding-block: clamp(2rem, 4vw, 3.5rem);
  /* Mismo cian clarito que el hero; arranca exactamente donde acaba el puente del hero */
  background: linear-gradient(180deg, #d9f0fa 0%, #e6f6fc 100%);
}
.facts__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem 1rem;
}
.fact {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  color: var(--color-ink);
}
.fact__icon-wrap {
  display: grid;
  flex: none;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  border: 1px solid rgb(6 26 44 / 0.18);
  background: rgb(255 255 255 / 0.45);
}
.fact__icon {
  width: 1.2rem;
  height: 1.2rem;
}
.fact__text {
  display: grid;
  gap: 0.15rem;
  min-width: 0;
}
.fact__main {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.005em;
}
.fact__sub {
  font-size: 0.8125rem;
  line-height: 1.25;
  color: var(--color-text-secondary);
}

@media (min-width: 1024px) {
  .facts__row {
    grid-template-columns: repeat(4, auto);
    justify-content: center;
    gap: 0;
  }
  .fact {
    padding-inline: clamp(1.5rem, 3vw, 3rem);
  }
  /* Filete fino entre elementos */
  .fact + .fact {
    border-left: 1px solid rgb(6 26 44 / 0.12);
  }
}
</style>
