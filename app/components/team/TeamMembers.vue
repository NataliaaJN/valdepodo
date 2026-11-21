<script setup lang="ts">
/**
 * Equipo (spec 05 §2): tríptico editorial. Las tres personas tienen exactamente el mismo peso: mismo ancho,
 * misma estructura y todo a la vista, sin pestañas ni acordeones que destaquen a nadie. Cada columna lleva un
 * retrato en arco sobre un fondo suave, nombre y cargo, una frase, sus datos (cifra, formación, áreas, qué hace)
 * y, al pie y alineada entre columnas, su forma de trabajar. Columnas separadas por filetes, no por cajas.
 * Hover: el retrato hace zoom 1,03. Sin foto: marcador. Los textos pendientes se resuelven con `ContentValue`.
 */
import { resolveValue } from '#shared/utils/pending'
import type { TeamMember } from '~/data/team'

defineProps<{ members: readonly TeamMember[] }>()

/** Tres tintes de la misma claridad: ninguna columna pesa más que otra. */
const tints = ['var(--color-cyan-light)', 'var(--color-ice)', 'var(--color-cyan-mist)']
</script>

<template>
  <div class="trio">
    <template v-for="(m, i) in members" :key="m.id">
      <article v-if="m.profile" v-reveal="i" class="person" :aria-labelledby="`${m.id}-name`">
        <div class="portrait" :style="{ '--tint': tints[i % tints.length] }">
          <img
            v-if="m.photo"
            :src="publicUrl(m.photo.src)"
            :alt="m.photo.alt"
            width="800"
            height="1000"
            loading="lazy"
            class="portrait__img"
          />
          <PhotoPlaceholder v-else ratio="4 / 5" variant="portrait" class="portrait__img" />
          <a v-if="m.linkedin" :href="resolveValue(m.linkedin)" target="_blank" rel="noopener" class="social">
            <BaseIcon name="linkedin" class="size-5" />
            <span class="sr-only">LinkedIn de {{ resolveValue(m.name) }} (se abre en una pestaña nueva)</span>
          </a>
        </div>

        <header class="who">
          <h3 :id="`${m.id}-name`" class="who__name">{{ resolveValue(m.name) }}</h3>
          <p class="who__role"><ContentValue :value="m.role" /></p>
        </header>

        <p class="lead"><ContentValue :value="m.profile.lead" /></p>

        <p v-if="m.profile.stat" class="stat">
          <span class="stat__value">{{ m.profile.stat.value }}</span>
          <span class="stat__label">{{ m.profile.stat.label }}</span>
        </p>

        <section v-if="m.profile.path" class="blk" :aria-labelledby="`${m.id}-path`">
          <h4 :id="`${m.id}-path`" class="blk__title">Formación y trayectoria</h4>
          <ol class="path">
            <li v-for="(step, k) in m.profile.path" :key="k" class="path__item">
              <p class="path__title">
                <ContentValue :value="step.title" />
                <span v-if="step.when" class="path__when">{{ step.when }}</span>
              </p>
              <p class="path__place"><ContentValue :value="step.place" /></p>
            </li>
          </ol>
        </section>

        <section v-if="m.profile.interests" class="blk" :aria-labelledby="`${m.id}-int`">
          <h4 :id="`${m.id}-int`" class="blk__title">Áreas de interés</h4>
          <ul class="chips">
            <li v-for="(a, k) in m.profile.interests" :key="k"><ContentValue :value="a" /></li>
          </ul>
        </section>

        <section class="blk" :aria-labelledby="`${m.id}-prac`">
          <h4 :id="`${m.id}-prac`" class="blk__title">{{ m.profile.practice.title }}</h4>
          <ul class="prac">
            <li v-for="(item, k) in m.profile.practice.items" :key="k">
              <BaseIcon name="check" class="size-5 flex-none" />
              <ContentValue :value="item" />
            </li>
          </ul>
        </section>

        <blockquote class="approach">
          <p class="approach__trait"><ContentValue :value="m.profile.approach.trait" /></p>
          <p class="approach__text"><ContentValue :value="m.profile.approach.text" /></p>
        </blockquote>
      </article>
    </template>
  </div>
</template>

<style scoped>
.trio {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 3.5rem;
}
.person {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
}

/* ---------- Retrato en arco ---------- */
.portrait {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  border-radius: 999px 999px var(--radius-l) var(--radius-l);
  background: var(--tint);
  transform: translateZ(0);
}
.portrait__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 15%;
  scale: 1;
  transition: scale var(--dur-image) var(--ease-out-soft);
}
.social {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-s);
  background: var(--color-bone);
  color: var(--color-ink);
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft),
    scale var(--dur-fast) var(--ease-out-soft);
}
.social:active {
  scale: 0.96;
}

/* ---------- Texto ---------- */
.who__name {
  font-family: var(--font-display);
  font-weight: 650;
  font-stretch: 80%;
  font-size: clamp(1.75rem, 1.3rem + 1.4vw, 2.5rem);
  line-height: 1;
  color: var(--color-ink);
  text-wrap: balance;
}
.who__role {
  margin-top: 0.5rem;
  color: var(--color-text-secondary);
}
.lead {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(1.25rem, 1.05rem + 0.6vw, 1.5rem);
  line-height: 1.2;
  color: var(--color-ink);
  text-wrap: pretty;
}
.stat {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}
.stat__value {
  font-family: var(--font-display);
  font-weight: 700;
  font-stretch: 75%;
  font-size: 4.5rem;
  line-height: 0.8;
  color: var(--color-ink);
}
.stat__label {
  line-height: 1.3;
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
}
.blk {
  display: grid;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}
.blk__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-ink);
}

.path {
  display: grid;
  gap: 0.875rem;
}
.path__title {
  font-weight: 650;
  line-height: 1.3;
  color: var(--color-ink);
}
.path__when {
  margin-left: 0.5rem;
  font-size: var(--text-small);
  font-weight: 500;
  color: var(--color-text-secondary);
}
.path__place {
  font-size: 0.9375rem;
  line-height: 1.35;
  color: var(--color-text-secondary);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.chips li {
  padding: 0.3125rem 0.75rem;
  border: 1px solid var(--color-ink);
  border-radius: var(--radius-pill);
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--color-ink);
}
.prac li {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0;
  font-size: 0.9375rem;
}
.prac li + li {
  border-top: 1px solid var(--color-border);
}

/* Forma de trabajar: pegada al pie, alineada entre columnas */
.approach {
  margin-top: auto;
  padding: 1.25rem;
  border-radius: var(--radius-m);
  background: var(--color-primary);
  color: var(--color-ink);
}
.approach__trait {
  font-family: var(--font-display);
  font-weight: 650;
  font-stretch: 80%;
  font-size: 1.375rem;
  line-height: 1.1;
}
.approach__text {
  margin-top: 0.625rem;
  font-size: 0.9375rem;
  line-height: 1.5;
}

@media (min-width: 768px) {
  .trio {
    max-width: 34rem;
    margin-inline: auto;
  }
}
@media (min-width: 1024px) {
  .trio {
    --cg: clamp(2rem, 4vw, 4rem);
    max-width: none;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: var(--cg);
    row-gap: 0;
  }
  /* Filete en mitad del hueco: las tres columnas miden exactamente lo mismo */
  .person + .person::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(var(--cg) / -2);
    width: 1px;
    background: var(--color-border);
  }
  /* Nombres de una o dos líneas: la frase empieza a la misma altura en las tres */
  .who__name {
    min-height: 2em;
  }
}
@media (hover: hover) and (pointer: fine) {
  .portrait:hover .portrait__img {
    scale: 1.03;
  }
  .social:hover {
    background: var(--color-ink);
    color: var(--color-bone);
  }
}
@media (prefers-reduced-motion: reduce) {
  .portrait__img,
  .social {
    transition-duration: 1ms;
  }
}
</style>
