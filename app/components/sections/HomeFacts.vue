<script setup lang="ts">
/**
 * Datos de la clínica, FUERA del hero: cuatro tarjetas pequeñas en vertical (icono arriba, texto abajo),
 * de vidrio claro sobre un fondo pálido. Solo el diseño sigue la referencia; el contenido son los `values`.
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
const cards = computed(() =>
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
        <li v-for="(card, i) in cards" :key="card.id" v-reveal="i" class="fact">
          <span class="fact__bubble" aria-hidden="true">
            <BaseIcon :name="icons[card.id]" class="fact__icon" />
          </span>
          <span class="fact__main">
            <template v-if="card.id === 'years'">
              <ContentValue :value="site.foundedYear" as="span">{{ clinic.years }}</ContentValue> años
            </template>
            <template v-else>{{ card.main }}</template>
          </span>
          <span class="fact__sub">{{ card.sub }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.facts {
  padding-block: clamp(2.5rem, 5vw, 4.5rem);
  background:
    radial-gradient(60% 120% at 20% 0%, rgb(191 216 234 / 0.55), rgb(191 216 234 / 0) 70%),
    radial-gradient(50% 120% at 85% 100%, rgb(30 171 225 / 0.12), rgb(30 171 225 / 0) 70%),
    var(--color-surface);
}
.facts__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  justify-content: center;
  gap: 0.75rem;
}
.fact {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 1.25rem 0.75rem 1.1rem;
  text-align: center;
  color: var(--color-ink);
  border-radius: 1.5rem;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.85), rgb(255 255 255 / 0.5));
  border: 1px solid rgb(255 255 255 / 0.9);
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.9) inset,
    0 14px 30px -18px rgb(18 112 182 / 0.35);
  backdrop-filter: blur(14px);
}
.fact__bubble {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  margin-bottom: 0.7rem;
  border-radius: 999px;
  color: #fff;
  background:
    radial-gradient(circle at 32% 26%, rgb(255 255 255 / 0.75) 0 12%, rgb(255 255 255 / 0) 38%),
    radial-gradient(circle at 50% 60%, #35b9ea 0%, var(--color-primary) 78%);
  box-shadow:
    0 10px 18px -8px rgb(18 112 182 / 0.65),
    inset 0 -6px 10px rgb(6 26 44 / 0.18);
}
.fact__icon {
  width: 1.5rem;
  height: 1.5rem;
}
.fact__main {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.01em;
}
.fact__sub {
  min-height: 1.1em;
  font-size: 0.8125rem;
  line-height: 1.2;
  color: var(--color-text-secondary);
}

@media (min-width: 768px) {
  .facts__row {
    grid-template-columns: repeat(4, minmax(0, 11.5rem));
    gap: 1rem;
  }
}
</style>
