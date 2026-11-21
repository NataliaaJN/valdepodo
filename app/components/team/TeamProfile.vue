<script setup lang="ts">
/**
 * Perfil ampliado de una profesional (spec 05 §2): capítulo de tinta a sangre. A la izquierda, el retrato
 * grande (4:5) que se queda fijo mientras se lee; a la derecha, el nombre en grande y cuatro bloques:
 * formación (línea de tiempo), áreas de interés, qué hace en consulta y su forma de trabajar.
 * Solo se usa con miembros que tienen `profile`; el resto va como `TeamCard`.
 * Hover: la foto hace zoom 1,03; las filas de consulta suben 2 px. Sin JS ni scroll-linked: todo visible.
 */
import { resolveValue } from '#shared/utils/pending'
import type { TeamMember } from '~/data/team'

const props = defineProps<{ member: TeamMember; flip?: boolean }>()
const nameId = `profile-${props.member.id}-name`
const name = computed(() => resolveValue(props.member.name))
const first = computed(() => name.value.split(' ')[0])
const profile = computed(() => props.member.profile!)
</script>

<template>
  <article class="prof" :class="{ 'prof--flip': flip }" :aria-labelledby="nameId">
    <div class="prof__aside">
      <div class="prof__sticky">
        <div class="prof__frame">
          <img
            v-if="member.photo"
            :src="publicUrl(member.photo.src)"
            :alt="member.photo.alt"
            width="800"
            height="1000"
            loading="lazy"
            class="prof__photo"
          />
          <a
            v-if="member.linkedin"
            :href="resolveValue(member.linkedin)"
            target="_blank"
            rel="noopener"
            class="prof__social"
          >
            <BaseIcon name="linkedin" class="size-5" />
            <span>LinkedIn</span>
            <span class="sr-only">de {{ name }} (se abre en una pestaña nueva)</span>
          </a>
        </div>
        <p class="prof__ghost" aria-hidden="true">{{ first }}</p>
      </div>
    </div>

    <div class="prof__body">
      <header v-reveal>
        <p class="prof__role"><ContentValue :value="member.role" /></p>
        <h3 :id="nameId" class="prof__name">{{ name }}</h3>
        <p class="prof__lead">{{ profile.lead }}</p>
      </header>

      <!-- Áreas de interés -->
      <section v-reveal class="blk" :aria-labelledby="`${nameId}-int`">
        <h4 :id="`${nameId}-int`" class="blk__title">Áreas de interés</h4>
        <ul class="chips">
          <li v-for="a in profile.interests" :key="a">{{ a }}</li>
        </ul>
      </section>

      <!-- Formación -->
      <section v-reveal class="blk" :aria-labelledby="`${nameId}-path`">
        <h4 :id="`${nameId}-path`" class="blk__title">Formación y trayectoria</h4>
        <ol class="path">
          <li v-for="step in profile.path" :key="step.title" class="path__item">
            <p v-if="step.when" class="path__when">{{ step.when }}</p>
            <p class="path__title">{{ step.title }}</p>
            <p class="path__place">{{ step.place }}</p>
          </li>
        </ol>
      </section>

      <!-- En consulta -->
      <section v-reveal class="blk" :aria-labelledby="`${nameId}-prac`">
        <h4 :id="`${nameId}-prac`" class="blk__title">En consulta</h4>
        <ul class="prac">
          <li v-for="(item, i) in profile.practice" :key="item" class="prac__item">
            <span class="prac__n" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </section>

      <!-- Forma de trabajar -->
      <blockquote v-reveal class="approach">
        <p class="approach__trait">{{ profile.approach.trait }}</p>
        <p class="approach__text">{{ profile.approach.text }}</p>
      </blockquote>
    </div>
  </article>
</template>

<style scoped>
.prof {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2.5rem;
  color: var(--color-bone);
}
.prof__sticky {
  position: relative;
}
.prof__frame {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-l);
  background: var(--color-text);
  transform: translateZ(0);
}
.prof__photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 20%;
  scale: 1;
  transition: scale var(--dur-image) var(--ease-out-soft);
}
.prof__social {
  position: absolute;
  left: 0.75rem;
  bottom: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0 1rem 0 0.75rem;
  border-radius: var(--radius-s);
  background: var(--color-bone);
  color: var(--color-ink);
  font-size: 0.9375rem;
  font-weight: 600;
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    scale var(--dur-fast) var(--ease-out-soft);
}
.prof__social:active {
  scale: 0.97;
}
/* Nombre de pila gigante en trazo, anclado a la base de la foto */
.prof__ghost {
  display: none;
}

/* ---------- Cuerpo ---------- */
.prof__body {
  display: grid;
  gap: clamp(2rem, 4vw, 3rem);
  align-content: start;
}
.prof__role {
  font-size: var(--text-eyebrow);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary);
}
.prof__name {
  margin-top: 0.75rem;
  font-family: var(--font-display);
  font-weight: 650;
  font-stretch: 80%;
  font-size: var(--text-display-m);
  line-height: 0.98;
  letter-spacing: -0.01em;
  text-wrap: balance;
}
.prof__lead {
  margin-top: 1rem;
  max-width: 34ch;
  font-size: var(--text-body-l);
  line-height: 1.45;
  color: var(--color-ice-blue);
}
.blk {
  display: grid;
  gap: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgb(241 239 233 / 0.2);
}
.blk__title {
  font-size: var(--text-eyebrow);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(241 239 233 / 0.65);
}

/* Chips */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.chips li {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: var(--color-ink);
  font-weight: 600;
  font-size: 0.9375rem;
}

/* Línea de tiempo */
.path {
  position: relative;
  display: grid;
  gap: 1.5rem;
  padding-left: 1.75rem;
}
.path::before {
  content: '';
  position: absolute;
  left: 0.3125rem;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 1px;
  background: rgb(241 239 233 / 0.3);
}
.path__item {
  position: relative;
}
.path__item::before {
  content: '';
  position: absolute;
  left: calc(-1.75rem + 0.0625rem);
  top: 0.4rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-ink);
}
.path__when {
  font-size: var(--text-small);
  font-weight: 600;
  color: var(--color-primary);
}
.path__title {
  margin-top: 0.125rem;
  font-family: var(--font-display);
  font-size: var(--text-heading-s);
  line-height: 1.15;
}
.path__place {
  margin-top: 0.25rem;
  color: rgb(241 239 233 / 0.7);
  font-size: 0.9375rem;
}

/* En consulta */
.prac {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.75rem;
}
.prac__item {
  display: flex;
  align-items: baseline;
  gap: 0.875rem;
  padding: 1rem 1.125rem;
  border: 1px solid rgb(241 239 233 / 0.2);
  border-radius: var(--radius-m);
  font-size: 1.0625rem;
  line-height: 1.3;
  transition:
    translate var(--dur-base) var(--ease-out-soft),
    background-color var(--dur-base) var(--ease-out-soft);
}
.prac__n {
  font-family: var(--font-display);
  font-weight: 650;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
}

/* Forma de trabajar */
.approach {
  padding: clamp(1.5rem, 3vw, 2.25rem);
  border-radius: var(--radius-l);
  background: var(--color-primary);
  color: var(--color-ink);
}
.approach__trait {
  font-family: var(--font-display);
  font-weight: 650;
  font-stretch: 80%;
  font-size: var(--text-display-m);
  line-height: 0.98;
}
.approach__text {
  margin-top: 1rem;
  max-width: 46ch;
  font-size: var(--text-body-l);
  line-height: 1.45;
}

@media (min-width: 640px) {
  .prac {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .prof {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
    align-items: start;
  }
  .prof__aside {
    grid-column: 1 / span 5;
    align-self: stretch;
  }
  .prof__body {
    grid-column: 7 / span 6;
  }
  .prof--flip .prof__aside {
    grid-column: 8 / span 5;
    grid-row: 1;
  }
  .prof--flip .prof__body {
    grid-column: 1 / span 6;
    grid-row: 1;
  }
  .prof__sticky {
    position: sticky;
    top: calc(var(--nav-h-compact) + 1.5rem);
  }
  .prof__ghost {
    display: block;
    margin-top: 1.5rem;
    font-family: var(--font-display);
    font-weight: 700;
    font-stretch: 75%;
    font-size: clamp(5rem, 2rem + 9vw, 11rem);
    line-height: 0.8;
    letter-spacing: -0.02em;
    color: transparent;
    -webkit-text-stroke: 1px rgb(241 239 233 / 0.35);
    user-select: none;
  }
}
@media (hover: hover) and (pointer: fine) {
  .prof__frame:hover .prof__photo {
    scale: 1.03;
  }
  .prof__social:hover {
    background: var(--color-primary);
  }
  .prac__item:hover {
    translate: 0 -2px;
    background-color: rgb(241 239 233 / 0.06);
  }
}
@media (prefers-reduced-motion: reduce) {
  .prof__photo,
  .prof__social,
  .prac__item {
    transition-duration: 1ms;
  }
}
</style>
