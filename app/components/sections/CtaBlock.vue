<script setup lang="ts">
/**
 * Cierre conceptual de la web: «Da el próximo paso.» en tres líneas cuya escala crece (como una pisada que
 * se acerca) sobre el azul Valdepodo, con el pie —el póster del 3D— entrando por abajo y un único botón
 * magnético. Se usa al final de TODAS las páginas: lo que cambia es la línea de contexto (`title`) que
 * la antecede, no el cierre.
 */
import { gsap } from 'gsap'
import type { Maybe } from '#shared/utils/pending'

const props = defineProps<{
  /** Línea de contexto de la página (p. ej. «¿No sabes qué necesita tu pie?»). */
  title?: { before: string; accent: string; after?: string }
  text?: Maybe<string>
  cta: { label: string; to: string }
  /** Enlace secundario opcional (p. ej. llamar). */
  secondary?: { label: string; to?: string; href?: string }
}>()

const lead = computed(() =>
  props.title ? `${props.title.before}${props.title.accent}${props.title.after ?? ''}` : '',
)

const root = ref<HTMLElement | null>(null)
const orb = ref<{ $el: HTMLElement } | HTMLElement | null>(null)
const orbEl = () => (orb.value && '$el' in orb.value ? orb.value.$el : orb.value) as HTMLElement | null

useGsapContext(root, (c) => {
  if (c.reduce || !root.value) return undefined
  const lines = root.value.querySelectorAll('[data-line] > span')
  gsap.from(lines, {
    yPercent: 110,
    duration: 1.3,
    ease: 'expo.out',
    stagger: 0.14,
    scrollTrigger: { trigger: root.value, start: 'top 55%', once: true },
  })
  if (c.desktop) {
    gsap.fromTo(
      root.value.querySelector('[data-foot]'),
      { yPercent: 14 },
      {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
      },
    )
  }
  return undefined
})

/* Botón magnético: sigue al puntero un máximo de 14 px (solo ratón) */
function onMove(e: PointerEvent) {
  const el = orbEl()
  if (!el || e.pointerType !== 'mouse') return
  const r = el.getBoundingClientRect()
  const x = (e.clientX - (r.left + r.width / 2)) / r.width
  const y = (e.clientY - (r.top + r.height / 2)) / r.height
  el.style.setProperty('--mx', `${(x * 28).toFixed(1)}px`)
  el.style.setProperty('--my', `${(y * 28).toFixed(1)}px`)
}
function onLeave() {
  orbEl()?.style.setProperty('--mx', '0px')
  orbEl()?.style.setProperty('--my', '0px')
}
</script>

<template>
  <section
    ref="root"
    class="cta chapter-blue section-clip relative isolate"
    data-nav-theme="blue"
    aria-labelledby="cta-title"
  >
    <!-- El pie del 3D (póster estático): entra por abajo y se recorta -->
    <picture class="cta__foot" data-foot aria-hidden="true">
      <source srcset="/images/3d-fallbacks/foot/skin.avif" type="image/avif" />
      <img
        src="/images/3d-fallbacks/foot/skin.webp"
        alt=""
        width="1600"
        height="1600"
        loading="lazy"
        decoding="async"
      />
    </picture>

    <div class="container-wide cta__inner">
      <p v-if="lead" v-reveal class="cta__lead text-heading-s">{{ lead }}</p>

      <h2 id="cta-title" class="cta__claim mega" aria-label="Da el próximo paso.">
        <span class="line line--1" data-line aria-hidden="true"><span>Da el</span></span>
        <span class="line line--2" data-line aria-hidden="true"><span>próximo</span></span>
        <span class="line line--3" data-line aria-hidden="true"><span>paso.</span></span>
      </h2>

      <div class="cta__actions">
        <NuxtLink ref="orb" :to="cta.to" class="orb" @pointermove="onMove" @pointerleave="onLeave">
          <span class="orb__in">
            {{ cta.label }}
            <BaseIcon name="arrow-right" class="size-5" />
          </span>
        </NuxtLink>
        <BaseButton
          v-if="secondary"
          variant="ghost"
          :to="secondary.to"
          :href="secondary.href"
          class="cta__secondary"
        >
          {{ secondary.label }}
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta {
  min-height: min(100svh, 62rem);
  display: flex;
  align-items: flex-end;
  padding-block: clamp(5rem, 9vw, 9rem) clamp(2rem, 4vw, 4rem);
}
.cta__foot {
  position: absolute;
  z-index: -1;
  right: -14vw;
  bottom: -18vw;
  width: min(78vw, 1200px);
  pointer-events: none;
  opacity: 0.96;
}
.cta__foot img {
  width: 100%;
  height: auto;
}
.cta__inner {
  position: relative;
  display: grid;
  gap: 2rem;
}
.cta__lead {
  max-width: 24ch;
  color: var(--color-ice-blue);
  font-family: var(--font-display);
  font-weight: 500;
  letter-spacing: -0.02em;
}

/* Escala progresiva por línea: cada «paso» es más grande que el anterior */
.cta__claim {
  display: grid;
  justify-items: start;
  font-size: inherit;
  line-height: 1;
}
.line {
  display: block;
  overflow: hidden;
  /* Aire arriba para que no se recorten las tildes con el interlineado compacto */
  padding-block: 0.14em 0.2em;
  margin-block: -0.14em -0.2em;
  line-height: 0.84;
}
.line > span {
  display: block;
}
.line--1 {
  font-size: clamp(3.25rem, 1rem + 11vw, 11rem);
  padding-left: 0;
}
.line--2 {
  font-size: clamp(4.5rem, 1rem + 17vw, 17rem);
  padding-left: clamp(0.5rem, 5vw, 6rem);
}
.line--3 {
  font-size: clamp(6rem, 1rem + 25vw, 25rem);
  padding-left: clamp(1rem, 12vw, 16rem);
}

.cta__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 2rem;
}

/* Botón magnético circular: el único CTA */
.orb {
  --mx: 0px;
  --my: 0px;
  display: grid;
  place-items: center;
  width: clamp(7.5rem, 5rem + 8vw, 11rem);
  aspect-ratio: 1;
  border-radius: 999px;
  background: var(--color-bone);
  color: var(--color-ink);
  font-weight: 500;
  font-size: 1rem;
  translate: var(--mx) var(--my);
  transition:
    translate 600ms var(--ease-out-soft),
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft),
    scale var(--dur-base) var(--ease-out-soft);
}
.orb__in {
  display: grid;
  justify-items: center;
  gap: 0.375rem;
}
@media (hover: hover) and (pointer: fine) {
  .orb:hover {
    background: var(--color-ink);
    color: var(--color-bone);
    scale: 1.08;
  }
}
.cta__secondary {
  color: var(--color-bone);
}

@media (min-width: 1024px) {
  .cta__inner {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
    column-gap: 3rem;
  }
  .cta__lead {
    grid-column: 1 / -1;
  }
  .cta__actions {
    flex-direction: column;
    align-items: flex-end;
    padding-bottom: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .orb {
    transition:
      background-color 150ms linear,
      color 150ms linear;
    translate: none;
  }
  .orb:hover {
    scale: 1;
  }
}
</style>
