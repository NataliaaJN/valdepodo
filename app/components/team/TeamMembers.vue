<script setup lang="ts">
/**
 * Equipo (spec 05 §2): tarjetas de retrato a sangre, las tres iguales. En reposo solo se ve la foto y un panel
 * de cristal con nombre, apellidos y puesto. Al pasar el ratón (o enfocar con teclado) el panel se abre y
 * muestra el icono de LinkedIn (solo si la persona lo autoriza) y «Ver perfil», que abre una ficha completa en
 * un `<dialog>` (formación, áreas, qué hace, forma de trabajar) con anterior/siguiente entre las tres.
 * Táctil: sin hover, así que las acciones están siempre visibles y toda la tarjeta abre la ficha.
 * Responsive: 1 columna en móvil, 3 desde 768 px. La ficha es de pantalla completa en móvil y de dos
 * columnas (foto + texto con scroll propio) en pantallas anchas.
 */
import { resolveValue } from '#shared/utils/pending'
import type { TeamMember } from '~/data/team'

const props = defineProps<{ members: readonly TeamMember[] }>()

const people = computed(() => props.members.filter((m) => m.profile))
const dialog = ref<HTMLDialogElement | null>(null)
const current = ref(0)
const cur = computed(() => people.value[current.value]!)
let opener: HTMLElement | null = null

function open(i: number, e: Event) {
  opener = e.currentTarget as HTMLElement
  current.value = i
  document.documentElement.style.overflow = 'hidden'
  dialog.value?.showModal()
  dialog.value?.scrollTo({ top: 0 })
  dialog.value?.querySelector('.sheet__body')?.scrollTo({ top: 0 })
}
function close() {
  dialog.value?.close()
}
function step(delta: number) {
  const n = people.value.length
  current.value = (current.value + delta + n) % n
  dialog.value?.querySelector('.sheet__body')?.scrollTo({ top: 0 })
  // En móvil el que hace scroll es el propio <dialog> (ficha a pantalla completa): se vuelve arriba para que se
  // vea la foto y el nombre de la persona nueva. En ≥ 768 px la ficha cabe y solo scrollea `.sheet__body`.
  if (window.matchMedia('(max-width: 767px)').matches) dialog.value?.scrollTo({ top: 0 })
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'ArrowLeft') step(-1)
}
function onClose() {
  document.documentElement.style.overflow = ''
  opener?.focus()
}
onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <div class="team">
    <ul class="grid">
      <li v-for="(m, i) in people" :key="m.id" v-reveal="i" class="card">
        <div class="card__media">
          <img
            v-if="m.photo"
            :src="publicUrl(m.photo.src)"
            :alt="m.photo.alt"
            width="800"
            height="1000"
            loading="lazy"
            class="card__img"
          />
          <PhotoPlaceholder v-else ratio="4 / 5" variant="portrait" class="card__img" />
        </div>

        <button
          type="button"
          class="card__open"
          :aria-label="`Ver el perfil completo de ${resolveValue(m.name)}`"
          @click="open(i, $event)"
        />
        <div class="glass">
          <p class="glass__name">{{ resolveValue(m.name) }}</p>
          <p class="glass__role"><ContentValue :value="m.role" /></p>
          <div class="glass__more" aria-hidden="true">
            <div class="glass__more-inner">
              <span class="pill">Ver perfil <BaseIcon name="arrow-right" class="size-4" /></span>
            </div>
          </div>
        </div>
        <a v-if="m.linkedin" :href="resolveValue(m.linkedin)" target="_blank" rel="noopener" class="social">
          <BaseIcon name="linkedin" class="size-5" />
          <span class="sr-only">LinkedIn de {{ resolveValue(m.name) }} (se abre en una pestaña nueva)</span>
        </a>
      </li>
    </ul>

    <!-- Ficha completa -->
    <dialog
      ref="dialog"
      class="sheet"
      aria-labelledby="sheet-name"
      @keydown="onKey"
      @close="onClose"
      @click.self="close"
    >
      <article v-if="cur?.profile" :key="cur.id" class="sheet__grid">
        <div class="sheet__photo">
          <img
            v-if="cur.photo"
            :src="publicUrl(cur.photo.src)"
            :alt="cur.photo.alt"
            width="800"
            height="1000"
            class="sheet__img"
          />
          <PhotoPlaceholder v-else ratio="4 / 5" variant="portrait" class="sheet__img" />
        </div>

        <div class="sheet__body">
          <header>
            <p class="role"><ContentValue :value="cur.role" /></p>
            <h3 id="sheet-name" class="name">{{ resolveValue(cur.name) }}</h3>
          </header>
          <p class="lead"><ContentValue :value="cur.profile.lead" /></p>

          <p v-if="cur.profile.stat" class="stat">
            <span class="stat__value">{{ cur.profile.stat.value }}</span>
            <span class="stat__label">{{ cur.profile.stat.label }}</span>
          </p>

          <section v-if="cur.profile.path" class="blk">
            <h4 class="blk__title">Formación y trayectoria</h4>
            <ol class="path">
              <li v-for="(st, k) in cur.profile.path" :key="k">
                <p class="path__title">
                  <ContentValue :value="st.title" />
                  <span v-if="st.when" class="path__when">{{ st.when }}</span>
                </p>
                <p class="path__place"><ContentValue :value="st.place" /></p>
              </li>
            </ol>
          </section>

          <section v-if="cur.profile.interests" class="blk">
            <h4 class="blk__title">Áreas de interés</h4>
            <ul class="chips">
              <li v-for="(a, k) in cur.profile.interests" :key="k"><ContentValue :value="a" /></li>
            </ul>
          </section>

          <section class="blk">
            <h4 class="blk__title">{{ cur.profile.practice.title }}</h4>
            <ul class="prac">
              <li v-for="(item, k) in cur.profile.practice.items" :key="k">
                <BaseIcon name="check" class="size-5 flex-none" />
                <ContentValue :value="item" />
              </li>
            </ul>
          </section>

          <blockquote class="approach">
            <p class="approach__trait"><ContentValue :value="cur.profile.approach.trait" /></p>
            <p class="approach__text"><ContentValue :value="cur.profile.approach.text" /></p>
          </blockquote>

          <div class="sheet__foot">
            <a
              v-if="cur.linkedin"
              :href="resolveValue(cur.linkedin)"
              target="_blank"
              rel="noopener"
              class="btn-line"
            >
              <BaseIcon name="linkedin" class="size-5" />
              LinkedIn
              <span class="sr-only">de {{ resolveValue(cur.name) }} (se abre en una pestaña nueva)</span>
            </a>
            <div class="sheet__nav">
              <button type="button" class="round" aria-label="Perfil anterior" @click="step(-1)">
                <BaseIcon name="arrow-left" />
              </button>
              <button type="button" class="round" aria-label="Perfil siguiente" @click="step(1)">
                <BaseIcon name="arrow-right" />
              </button>
            </div>
          </div>
        </div>
      </article>
      <button type="button" class="round sheet__close" aria-label="Cerrar perfil" @click="close">
        <BaseIcon name="close" />
      </button>
    </dialog>
  </div>
</template>

<style scoped>
/* ---------- Rejilla ---------- */
.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}
.card {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-l);
  background: var(--color-ink);
  color: var(--color-bone);
  isolation: isolate;
  transition: translate var(--dur-base) var(--ease-out-soft);
}
.card__media {
  position: absolute;
  inset: 0;
  z-index: -1;
}
.card__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 15%;
  scale: 1;
  transition: scale var(--dur-image) var(--ease-out-soft);
}

/* Panel de cristal: nombre y puesto siempre; las acciones al señalar */
.glass {
  position: absolute;
  inset: auto 0.75rem 0.75rem;
  z-index: 1;
  padding: 0.875rem 4rem 0.875rem 1rem;
  border: 1px solid rgb(255 255 255 / 0.22);
  border-radius: var(--radius-m);
  background: rgb(6 26 44 / 0.5);
  -webkit-backdrop-filter: blur(16px) saturate(1.3);
  backdrop-filter: blur(16px) saturate(1.3);
  pointer-events: none;
}
/* Botón invisible que cubre toda la tarjeta: la tarjeta entera abre la ficha */
.card__open {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  cursor: pointer;
}
.card__open:focus-visible {
  outline: none;
}
.card:has(.card__open:focus-visible) {
  box-shadow: var(--focus-ring);
}
.glass__name {
  font-family: var(--font-display);
  font-weight: 650;
  font-size: clamp(1.25rem, 1.05rem + 0.6vw, 1.5rem);
  line-height: 1.1;
  text-wrap: balance;
}
.glass__role {
  margin-top: 0.25rem;
  font-size: 0.9375rem;
  line-height: 1.3;
  color: var(--color-ice-blue);
}
.glass__more {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 450ms var(--ease-out-soft),
    opacity 300ms var(--ease-out-soft);
}
.glass__more-inner {
  min-height: 0;
  overflow: hidden;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  margin-top: 0.75rem;
  padding: 0 1rem;
  border-radius: var(--radius-s);
  background: var(--color-bone);
  color: var(--color-ink);
  font-weight: 600;
  font-size: 0.9375rem;
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    scale var(--dur-fast) var(--ease-out-soft);
}
.card:active .pill {
  scale: 0.97;
}
/* LinkedIn: esquina del panel, por encima de la tarjeta pulsable */
.social {
  position: absolute;
  z-index: 2;
  right: 0.75rem;
  bottom: 0.75rem;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid rgb(255 255 255 / 0.35);
  border-radius: var(--radius-s);
  color: var(--color-bone);
  opacity: 0;
  transition:
    opacity 300ms var(--ease-out-soft),
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft),
    scale var(--dur-fast) var(--ease-out-soft);
}
.social:active {
  scale: 0.96;
}

/* Visibles al enfocar, y siempre en táctil */
.card:focus-within .glass__more {
  grid-template-rows: 1fr;
  opacity: 1;
}
.card:focus-within .social {
  opacity: 1;
}
.card:focus-within .card__img {
  scale: 1.03;
}
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    translate: 0 -2px;
  }
  .card:hover .card__img {
    scale: 1.03;
  }
  .card:hover .glass__more {
    grid-template-rows: 1fr;
    opacity: 1;
  }
  .card:hover .social {
    opacity: 1;
  }
  .social:hover {
    background: var(--color-bone);
    color: var(--color-ink);
  }
  .card:hover .pill {
    background: var(--color-primary);
  }
}
@media (hover: none), (pointer: coarse) {
  .glass__more {
    grid-template-rows: 1fr;
    opacity: 1;
  }
  .social {
    opacity: 1;
  }
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
  }
  .card {
    aspect-ratio: 3 / 4;
  }
  .glass {
    inset: auto 0.5rem 0.5rem;
    padding: 0.75rem 3.75rem 0.75rem 0.75rem;
  }
}
@media (min-width: 1024px) {
  .grid {
    gap: 1.5rem;
    /* Tarjetas algo más contenidas: el bloque se centra bajo el título */
    max-width: 66rem;
    margin-inline: auto;
  }
  .card {
    aspect-ratio: 4 / 5;
  }
  .glass {
    inset: auto 0.75rem 0.75rem;
  }
  .glass {
    padding: 0.875rem 4rem 0.875rem 1rem;
  }
}

/* ---------- Ficha (dialog) ---------- */
.sheet {
  position: fixed;
  inset: 0;
  width: 100vw;
  max-width: none;
  height: 100dvh;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: var(--color-bone);
  color: var(--color-text);
  overflow: auto;
  overscroll-behavior: contain;
}
.sheet:not([open]) {
  display: none;
}
.sheet[open] {
  animation: sheet-in 450ms var(--ease-out-soft);
}
.sheet::backdrop {
  background: rgb(6 26 44 / 0.72);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}
@keyframes sheet-in {
  from {
    opacity: 0;
    translate: 0 16px;
  }
}
.sheet__close {
  position: fixed;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 3;
  background: var(--color-bone);
  box-shadow: var(--shadow-float);
}
.sheet__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}
.sheet__photo {
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--color-ink);
  overflow: hidden;
}
.sheet__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 15%;
}
.sheet__body {
  display: grid;
  gap: 1.5rem;
  align-content: start;
  padding: 1.75rem var(--gutter) 2.5rem;
}
.role {
  font-weight: 600;
  color: var(--color-text-secondary);
}
.name {
  margin-top: 0.375rem;
  font-family: var(--font-display);
  font-weight: 650;
  font-stretch: 80%;
  font-size: var(--text-display-m);
  line-height: 0.98;
  color: var(--color-ink);
  text-wrap: balance;
}
.lead {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(1.25rem, 1.05rem + 0.8vw, 1.625rem);
  line-height: 1.2;
  color: var(--color-ink);
  text-wrap: pretty;
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
  font-size: 5rem;
  line-height: 0.8;
  color: var(--color-ink);
}
.stat__label {
  max-width: 20ch;
  line-height: 1.3;
  color: var(--color-text-secondary);
}
.blk {
  display: grid;
  gap: 0.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
}
.blk__title {
  font-weight: 700;
  color: var(--color-ink);
}
.path {
  position: relative;
  display: grid;
  gap: 1rem;
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
.path li {
  position: relative;
}
.path li::before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 0.45rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-bone);
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
  color: var(--color-text-secondary);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.chips li {
  padding: 0.3125rem 0.875rem;
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
  padding: 0.625rem 0;
}
.prac li + li {
  border-top: 1px solid var(--color-border);
}
.approach {
  padding: 1.25rem 1.375rem;
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
  margin-top: 0.625rem;
  line-height: 1.5;
}
.sheet__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.5rem;
}
.sheet__nav {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}
.btn-line {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0 1.125rem 0 0.875rem;
  border: 1px solid var(--color-ink);
  border-radius: var(--radius-s);
  font-weight: 600;
  color: var(--color-ink);
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft),
    scale var(--dur-fast) var(--ease-out-soft);
}
.btn-line:active {
  scale: 0.97;
}
.round {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--color-ink);
  border-radius: 50%;
  color: var(--color-ink);
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft),
    scale var(--dur-fast) var(--ease-out-soft);
}
.round:active {
  scale: 0.94;
}
.sheet__close:focus-visible,
.round:focus-visible,
.btn-line:focus-visible,
.social:focus-visible {
  outline: 2px solid var(--color-primary-strong);
  outline-offset: 3px;
}
.social:focus-visible {
  outline-color: var(--color-bone);
}
@media (hover: hover) and (pointer: fine) {
  .btn-line:hover,
  .round:hover {
    background: var(--color-ink);
    color: var(--color-bone);
  }
}

@media (min-width: 768px) {
  .sheet {
    inset: 0;
    width: min(68rem, calc(100vw - 3rem));
    height: min(46rem, calc(100dvh - 3rem));
    margin: auto;
    border-radius: var(--radius-l);
    overflow: hidden;
  }
  .sheet__close {
    position: absolute;
  }
  .sheet__grid {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    height: 100%;
  }
  .sheet__photo {
    aspect-ratio: auto;
  }
  .sheet__body {
    overflow-y: auto;
    padding: 2.5rem 2.5rem 2rem;
    padding-top: 3.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card,
  .card__img,
  .glass__more,
  .social,
  .pill {
    transition-duration: 1ms;
  }
  .sheet[open] {
    animation: none;
  }
}
</style>
