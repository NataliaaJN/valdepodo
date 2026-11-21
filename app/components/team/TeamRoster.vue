<script setup lang="ts">
/**
 * Equipo (spec 05 §2): una tira de retratos que se abre como un acordeón. Las tres personas se ven a la vez;
 * la elegida se ensancha y debajo se despliega su ficha (titular, cifra, formación, áreas, qué hace y su
 * forma de trabajar). Patrón WAI-ARIA de pestañas: flechas, Inicio y Fin cambian de persona; todas las fichas
 * están en el DOM (las no activas, con `hidden`). Sin JS se ve la primera. Reduced motion: sin transiciones.
 */
import { resolveValue } from '#shared/utils/pending'
import type { TeamMember } from '~/data/team'

const props = defineProps<{ members: readonly TeamMember[] }>()

const active = ref(0)
const tabs = ref<HTMLButtonElement[]>([])
const first = (m: TeamMember) => resolveValue(m.name).split(' ')[0]

function select(i: number, focus = false) {
  active.value = i
  if (focus) tabs.value[i]?.focus()
}
function onKey(e: KeyboardEvent) {
  const n = props.members.length
  const map: Record<string, number> = {
    ArrowRight: (active.value + 1) % n,
    ArrowDown: (active.value + 1) % n,
    ArrowLeft: (active.value - 1 + n) % n,
    ArrowUp: (active.value - 1 + n) % n,
    Home: 0,
    End: n - 1,
  }
  const next = map[e.key]
  if (next === undefined) return
  e.preventDefault()
  select(next, true)
}
</script>

<template>
  <div class="roster">
    <div class="strip" role="tablist" aria-label="Equipo de Valdepodo" @keydown="onKey">
      <button
        v-for="(m, i) in members"
        :id="`tab-${m.id}`"
        :key="m.id"
        :ref="(el) => (tabs[i] = el as HTMLButtonElement)"
        type="button"
        role="tab"
        class="tab"
        :class="{ 'tab--on': active === i }"
        :aria-selected="active === i"
        :aria-controls="`panel-${m.id}`"
        :tabindex="active === i ? 0 : -1"
        @click="select(i)"
      >
        <img
          v-if="m.photo"
          :src="publicUrl(m.photo.src)"
          alt=""
          width="800"
          height="1000"
          loading="lazy"
          class="tab__img"
        />
        <PhotoPlaceholder v-else ratio="4 / 5" variant="portrait" class="tab__img" />
        <span class="tab__label">
          <span class="tab__first">{{ first(m) }}</span>
          <span class="tab__role"><ContentValue :value="m.role" /></span>
        </span>
      </button>
    </div>

    <template v-for="(m, i) in members" :key="`p-${m.id}`">
      <article
        v-if="m.profile"
        :id="`panel-${m.id}`"
        class="panel"
        role="tabpanel"
        :aria-labelledby="`tab-${m.id}`"
        :hidden="active !== i"
        tabindex="0"
      >
        <header class="panel__head">
          <div>
            <h3 class="panel__name">{{ resolveValue(m.name) }}</h3>
            <p class="panel__role"><ContentValue :value="m.role" /></p>
          </div>
          <a v-if="m.linkedin" :href="resolveValue(m.linkedin)" target="_blank" rel="noopener" class="social">
            <BaseIcon name="linkedin" class="size-5" />
            <span>LinkedIn</span>
            <span class="sr-only">de {{ resolveValue(m.name) }} (se abre en una pestaña nueva)</span>
          </a>
        </header>

        <div class="panel__grid">
          <div class="panel__intro">
            <p class="lead"><ContentValue :value="m.profile.lead" /></p>
            <blockquote class="approach">
              <p class="approach__trait"><ContentValue :value="m.profile.approach.trait" /></p>
              <p class="approach__text"><ContentValue :value="m.profile.approach.text" /></p>
            </blockquote>
          </div>

          <div class="panel__facts">
            <p v-if="m.profile.stat" class="stat">
              <span class="stat__value">{{ m.profile.stat.value }}</span>
              <span class="stat__label">{{ m.profile.stat.label }}</span>
            </p>

            <section v-if="m.profile.path" class="blk" :aria-labelledby="`${m.id}-path`">
              <h4 :id="`${m.id}-path`" class="blk__title">Formación y trayectoria</h4>
              <ol class="path">
                <li v-for="(step, k) in m.profile.path" :key="k" class="path__item">
                  <p v-if="step.when" class="path__when">{{ step.when }}</p>
                  <p class="path__title"><ContentValue :value="step.title" /></p>
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
                  <BaseIcon name="check" class="prac__ico size-5" />
                  <ContentValue :value="item" />
                </li>
              </ul>
            </section>
          </div>
        </div>
      </article>
    </template>
  </div>
</template>

<style scoped>
.roster {
  display: grid;
  gap: clamp(1rem, 2vw, 1.5rem);
}

/* ---------- Tira de retratos ---------- */
.strip {
  display: flex;
  gap: clamp(0.5rem, 1.2vw, 1rem);
  height: clamp(15rem, 38vw, 34rem);
}
.tab {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  padding: 0;
  border-radius: var(--radius-l);
  background: var(--color-ink);
  color: var(--color-bone);
  text-align: left;
  cursor: pointer;
  isolation: isolate;
  transition: flex-grow var(--dur-chapter) var(--ease-out-soft);
}
.tab--on {
  flex-grow: 1.9;
}
.tab__img {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 18%;
  opacity: 0.72;
  scale: 1;
  transition:
    opacity var(--dur-base) var(--ease-out-soft),
    scale var(--dur-image) var(--ease-out-soft);
}
.tab--on .tab__img {
  opacity: 1;
}
.tab::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(to top, rgb(6 26 44 / 0.78), rgb(6 26 44 / 0) 55%);
}
.tab__label {
  position: absolute;
  inset: auto 0 0 0;
  display: grid;
  gap: 0.125rem;
  padding: clamp(0.75rem, 1.6vw, 1.5rem);
}
.tab__first {
  font-family: var(--font-display);
  font-weight: 650;
  font-stretch: 80%;
  font-size: clamp(1.375rem, 0.9rem + 2.4vw, 3.5rem);
  line-height: 0.95;
}
.tab__role {
  display: none;
  font-size: 0.9375rem;
  color: var(--color-ice-blue);
}
.tab:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
/* El filo cian marca a quien se está viendo */
.tab--on::before {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 4px;
  background: var(--color-primary);
}
.tab:active {
  scale: 0.985;
}

/* ---------- Ficha ---------- */
.panel {
  padding: clamp(1.25rem, 3vw, 2.5rem);
  border-radius: var(--radius-l);
  background: var(--color-white);
  box-shadow: var(--shadow-soft);
  color: var(--color-text);
}
.panel:not([hidden]) {
  animation: panel-in 500ms var(--ease-out-soft);
}
.panel:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
@keyframes panel-in {
  from {
    opacity: 0;
    translate: 0 10px;
  }
}
.panel__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--color-border);
}
.panel__name {
  font-family: var(--font-display);
  font-weight: 650;
  font-stretch: 80%;
  font-size: var(--text-display-m);
  line-height: 0.98;
  color: var(--color-ink);
  text-wrap: balance;
}
.panel__role {
  margin-top: 0.5rem;
  color: var(--color-text-secondary);
}
.social {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0 1rem 0 0.75rem;
  border-radius: var(--radius-s);
  background: var(--color-ice);
  color: var(--color-ink);
  font-weight: 600;
  font-size: 0.9375rem;
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft),
    scale var(--dur-fast) var(--ease-out-soft);
}
.social:active {
  scale: 0.97;
}

.panel__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
  padding-top: 1.75rem;
}
.panel__intro {
  display: grid;
  gap: 1.75rem;
  align-content: start;
}
.lead {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(1.5rem, 1.1rem + 1.5vw, 2.5rem);
  line-height: 1.1;
  color: var(--color-ink);
  text-wrap: balance;
}
.approach {
  padding: clamp(1.25rem, 2.5vw, 1.75rem);
  border-radius: var(--radius-m);
  background: var(--color-primary);
  color: var(--color-ink);
}
.approach__trait {
  font-family: var(--font-display);
  font-weight: 650;
  font-stretch: 80%;
  font-size: var(--text-heading-s);
  line-height: 1.1;
}
.approach__text {
  margin-top: 0.75rem;
  max-width: 48ch;
  line-height: 1.5;
}

.panel__facts {
  display: grid;
  gap: 1.75rem;
  align-content: start;
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
  font-size: clamp(4rem, 2.5rem + 6vw, 7rem);
  line-height: 0.8;
  color: var(--color-ink);
}
.stat__label {
  max-width: 18ch;
  line-height: 1.3;
  color: var(--color-text-secondary);
}
.blk {
  display: grid;
  gap: 0.875rem;
}
.blk__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-ink);
}

.path {
  position: relative;
  display: grid;
  gap: 1.125rem;
  padding-left: 1.5rem;
}
.path::before {
  content: '';
  position: absolute;
  left: 0.25rem;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 1px;
  background: var(--color-border-strong);
}
.path__item {
  position: relative;
}
.path__item::before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 0.45rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-white);
}
.path__when {
  font-size: var(--text-small);
  font-weight: 600;
  color: var(--color-text-secondary);
}
.path__title {
  font-weight: 650;
  line-height: 1.3;
  color: var(--color-ink);
}
.path__place {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.chips li {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-ink);
  border-radius: var(--radius-pill);
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--color-ink);
}

.prac li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-top: 1px solid var(--color-border);
}
.prac li:last-child {
  border-bottom: 1px solid var(--color-border);
}
.prac__ico {
  flex: none;
  color: var(--color-ink);
}

@media (min-width: 768px) {
  .tab__role {
    display: block;
  }
}
@media (min-width: 1024px) {
  .panel__grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
  }
  .panel__intro {
    grid-column: 1 / span 6;
  }
  .panel__facts {
    grid-column: 8 / span 5;
  }
}
@media (hover: hover) and (pointer: fine) {
  .tab:hover .tab__img {
    scale: 1.03;
    opacity: 1;
  }
  .social:hover {
    background: var(--color-ink);
    color: var(--color-bone);
  }
}
@media (prefers-reduced-motion: reduce) {
  .tab,
  .tab__img,
  .social {
    transition-duration: 1ms;
  }
  .panel:not([hidden]) {
    animation: none;
  }
}
</style>
