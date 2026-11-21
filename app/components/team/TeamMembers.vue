<script setup lang="ts">
/**
 * Equipo (spec 05 §2): tres «capítulos» a sangre, uno por persona, como el resto del rediseño («Paso a paso»:
 * capítulos de color, tipografía monumental). Los tres son idénticos en estructura, tamaño y contenido, solo
 * cambian el color y el lado de la foto (alternan), así que nadie pesa más que otra:
 * mitad foto a sangre + mitad texto con el nombre de pila en grande, su frase, formación o cifra, áreas,
 * qué hace y su forma de trabajar. Todo el color sale de `currentColor`, así que cada capítulo cambia solo
 * `--bg` y `--fg`. Móvil: foto arriba a sangre y texto debajo. Hover: la foto hace zoom 1,03.
 */
import { resolveValue } from '#shared/utils/pending'
import type { TeamMember } from '~/data/team'

defineProps<{ members: readonly TeamMember[] }>()

/** Paleta de los capítulos: cian de marca, tinta y cian claro. */
const chapters = [
  { bg: 'var(--color-primary)', fg: 'var(--color-ink)', nav: 'bone' },
  { bg: 'var(--color-ink)', fg: 'var(--color-bone)', nav: 'ink' },
  { bg: 'var(--color-cyan-light)', fg: 'var(--color-ink)', nav: 'bone' },
] as const

const first = (m: TeamMember) => resolveValue(m.name).split(' ')[0]
</script>

<template>
  <div class="team">
    <template v-for="(m, i) in members" :key="m.id">
      <article
        v-if="m.profile"
        class="spread"
        :class="{ 'spread--flip': i % 2 === 1 }"
        :style="{ '--bg': chapters[i % 3]!.bg, '--fg': chapters[i % 3]!.fg }"
        :data-nav-theme="chapters[i % 3]!.nav"
        :aria-labelledby="`${m.id}-name`"
      >
        <div class="spread__photo">
          <img
            v-if="m.photo"
            :src="publicUrl(m.photo.src)"
            :alt="m.photo.alt"
            width="800"
            height="1000"
            loading="lazy"
            class="spread__img"
          />
          <PhotoPlaceholder v-else ratio="4 / 5" variant="portrait" class="spread__img" />
        </div>

        <div class="spread__text">
          <div v-reveal class="spread__inner">
            <header>
              <p class="role"><ContentValue :value="m.role" /></p>
              <h3 :id="`${m.id}-name`" class="name">
                <span class="name__first" aria-hidden="true">{{ first(m) }}</span>
                <span class="sr-only">{{ resolveValue(m.name) }}</span>
              </h3>
              <p v-if="resolveValue(m.name) !== first(m)" class="fullname" aria-hidden="true">
                {{ resolveValue(m.name) }}
              </p>
            </header>

            <p class="lead"><ContentValue :value="m.profile.lead" /></p>

            <div class="facts">
              <p v-if="m.profile.stat" class="stat">
                <span class="stat__value">{{ m.profile.stat.value }}</span>
                <span class="stat__label">{{ m.profile.stat.label }}</span>
              </p>

              <section v-if="m.profile.path" :aria-labelledby="`${m.id}-path`">
                <h4 :id="`${m.id}-path`" class="blk__title">Formación y trayectoria</h4>
                <ol class="path">
                  <li v-for="(step, k) in m.profile.path" :key="k">
                    <p class="path__title">
                      <ContentValue :value="step.title" />
                      <span v-if="step.when" class="path__when">{{ step.when }}</span>
                    </p>
                    <p class="path__place"><ContentValue :value="step.place" /></p>
                  </li>
                </ol>
              </section>

              <div class="facts__col">
                <section v-if="m.profile.interests" :aria-labelledby="`${m.id}-int`">
                  <h4 :id="`${m.id}-int`" class="blk__title">Áreas de interés</h4>
                  <ul class="chips">
                    <li v-for="(a, k) in m.profile.interests" :key="k"><ContentValue :value="a" /></li>
                  </ul>
                </section>

                <section :aria-labelledby="`${m.id}-prac`">
                  <h4 :id="`${m.id}-prac`" class="blk__title">{{ m.profile.practice.title }}</h4>
                  <ul class="prac">
                    <li v-for="(item, k) in m.profile.practice.items" :key="k">
                      <BaseIcon name="check" class="size-5 flex-none" />
                      <ContentValue :value="item" />
                    </li>
                  </ul>
                </section>
              </div>
            </div>

            <blockquote class="approach">
              <p class="approach__trait"><ContentValue :value="m.profile.approach.trait" /></p>
              <p class="approach__text"><ContentValue :value="m.profile.approach.text" /></p>
            </blockquote>

            <a
              v-if="m.linkedin"
              :href="resolveValue(m.linkedin)"
              target="_blank"
              rel="noopener"
              class="social"
            >
              <BaseIcon name="linkedin" class="size-5" />
              <span>LinkedIn</span>
              <span class="sr-only">de {{ resolveValue(m.name) }} (se abre en una pestaña nueva)</span>
            </a>
          </div>
        </div>
      </article>
    </template>
  </div>
</template>

<style scoped>
.spread {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  background: var(--bg);
  color: var(--fg);
}

/* ---------- Foto a sangre ---------- */
.spread__photo {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  max-height: 80svh;
  width: 100%;
  background: var(--color-text);
  transform: translateZ(0);
}
.spread__img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 14%;
  scale: 1;
  transition: scale var(--dur-image) var(--ease-out-soft);
}

/* ---------- Texto ---------- */
.spread__text {
  display: flex;
  align-items: center;
  padding: clamp(2.5rem, 6vw, 5rem) var(--gutter);
}
.spread__inner {
  display: grid;
  gap: clamp(1.5rem, 2.4vw, 2rem);
  width: 100%;
  max-width: 42rem;
}
.role {
  font-weight: 600;
  opacity: 0.8;
}
.name {
  margin-top: 0.5rem;
  line-height: 0.8;
}
.name__first {
  display: block;
  font-family: var(--font-display);
  font-weight: 700;
  font-stretch: 75%;
  font-size: clamp(4.5rem, 1rem + 10vw, 10rem);
  line-height: 0.82;
  letter-spacing: -0.02em;
}
.fullname {
  margin-top: 0.75rem;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: var(--text-heading-s);
  line-height: 1.1;
}
.lead {
  max-width: 34ch;
  font-size: var(--text-body-l);
  line-height: 1.4;
  text-wrap: pretty;
}

.facts {
  display: grid;
  gap: 1.75rem 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid color-mix(in srgb, currentColor 30%, transparent);
}
.facts__col {
  display: grid;
  gap: 1.5rem;
  align-content: start;
}
.blk__title {
  margin-bottom: 0.625rem;
  font-size: 0.9375rem;
  font-weight: 700;
}

.stat {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.stat__value {
  font-family: var(--font-display);
  font-weight: 700;
  font-stretch: 75%;
  font-size: clamp(4rem, 2rem + 5vw, 6.5rem);
  line-height: 0.8;
}
.stat__label {
  max-width: 20ch;
  line-height: 1.3;
}

.path {
  display: grid;
  gap: 0.875rem;
}
.path__title {
  font-weight: 650;
  line-height: 1.3;
}
.path__when {
  margin-left: 0.5rem;
  font-size: var(--text-small);
  font-weight: 500;
  opacity: 0.75;
}
.path__place {
  font-size: 0.9375rem;
  line-height: 1.35;
  opacity: 0.8;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.chips li {
  padding: 0.3125rem 0.75rem;
  border: 1px solid currentColor;
  border-radius: var(--radius-pill);
  font-weight: 600;
  font-size: 0.9375rem;
}
.prac li {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0;
  font-size: 0.9375rem;
}
.prac li + li {
  border-top: 1px solid color-mix(in srgb, currentColor 22%, transparent);
}

.approach {
  padding-top: 1.5rem;
  border-top: 1px solid color-mix(in srgb, currentColor 30%, transparent);
}
.approach__trait {
  font-family: var(--font-display);
  font-weight: 650;
  font-stretch: 80%;
  font-size: var(--text-heading-s);
  line-height: 1.1;
}
.approach__text {
  margin-top: 0.625rem;
  max-width: 52ch;
  line-height: 1.55;
}

.social {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  justify-self: start;
  min-height: 2.75rem;
  padding: 0 1.125rem 0 0.875rem;
  border: 1px solid currentColor;
  border-radius: var(--radius-s);
  font-weight: 600;
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft),
    scale var(--dur-fast) var(--ease-out-soft);
}
.social:active {
  scale: 0.97;
}
.social:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

@media (min-width: 640px) {
  .facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .stat {
    grid-column: 1 / -1;
  }
}
@media (min-width: 1024px) {
  .spread {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-height: clamp(36rem, 56vw, 52rem);
  }
  .spread__photo {
    aspect-ratio: auto;
    max-height: none;
    height: 100%;
  }
  .spread--flip .spread__photo {
    order: 2;
  }
  .spread__text {
    padding-inline: clamp(2rem, 5vw, 6rem);
  }
}
@media (hover: hover) and (pointer: fine) {
  .spread__photo:hover .spread__img {
    scale: 1.03;
  }
  .social:hover {
    background: var(--fg);
    color: var(--bg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .spread__img,
  .social {
    transition-duration: 1ms;
  }
}
</style>
