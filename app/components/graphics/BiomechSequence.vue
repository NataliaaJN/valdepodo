<script setup lang="ts">
/**
 * Secuencia de huellas del Estudio biomecánico (spec 04 §1.3) — experiencia destacada nº 2.
 *
 * - ≥ 768 px: dos columnas; el visual queda fijo (`position: sticky`) y ScrollTrigger decide la fase activa
 *   según el bloque de texto que cruza el centro del viewport. Escritorio: morph; tablet: solo fundidos.
 * - < 768 px: sin sticky. Cada fase es una tarjeta con su propio visual, que se "enciende" al entrar en
 *   viewport; una línea de recorrido vertical une las tarjetas.
 * - Reduced motion: cambios de estado inmediatos y sin bucles.
 * - Accesibilidad: las fases son un `<ol>`; todos los visuales son `aria-hidden`.
 *
 * Es SVG + GSAP: no depende de WebGL, así que no usa los niveles de `useDeviceTier` (spec 08 §3).
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { biomechPhases, ILLUSTRATIVE_LABEL } from '~/data/biomech'
import type { MapTransition } from '~/utils/pressure'

const phases = biomechPhases
const root = ref<HTMLElement | null>(null)
const items: HTMLElement[] = []
const active = ref(0)
const mode = ref<MapTransition>('instant')
const stageVisible = ref(false)

/* Visuales de las tarjetas móviles: encendido (una vez) y reproducción (mientras se ven). */
const lit = ref<boolean[]>(phases.map(() => false))
const playing = ref<boolean[]>(phases.map(() => false))

const current = computed(() => phases[active.value]!)
const lastNumber = phases[phases.length - 1]!.number

useGsapContext(root, (c) => {
  mode.value = c.reduce ? 'instant' : c.desktop ? 'morph' : 'fade'
  if (c.mobile) {
    if (c.motion) {
      gsap.utils.toArray<HTMLElement>('.bs-card', root.value).forEach((card) => {
        gsap.from(card, {
          y: 16,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        })
      })
    }
    return undefined
  }

  items.forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => {
        if (self.isActive) active.value = i
      },
    })
  })
  ScrollTrigger.create({
    trigger: root.value,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (stageVisible.value = self.isActive),
  })
  return undefined
})

let observer: IntersectionObserver | undefined
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const i = Number((entry.target as HTMLElement).dataset.index)
        playing.value[i] = entry.isIntersecting
        if (entry.isIntersecting) lit.value[i] = true
      }
    },
    { threshold: 0.35 },
  )
  root.value?.querySelectorAll<HTMLElement>('[data-mobile-visual]').forEach((el) => observer!.observe(el))
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section ref="root" class="biomech section-clip" aria-labelledby="biomech-title">
    <div class="container-site">
      <header class="max-w-[40rem]">
        <p class="eyebrow text-primary-strong">Cómo trabajamos</p>
        <h2 id="biomech-title" class="mt-3 font-display text-display-m text-deep-blue">
          Cada paso <em>cuenta</em>.
        </h2>
      </header>

      <div class="mt-10 md:grid md:grid-cols-2 md:gap-10 lg:grid-cols-12 lg:gap-16">
        <!-- Visual fijo (tablet y escritorio) -->
        <div class="hidden md:block lg:col-span-7" aria-hidden="true">
          <div class="sticky top-0 flex h-svh items-center">
            <div class="flex w-full items-center gap-5 lg:gap-10">
              <div class="shrink-0">
                <p class="font-display text-display-m leading-none text-primary-strong">{{ current.number }}</p>
                <p class="mt-1 text-sm text-text-secondary">— {{ lastNumber }}</p>
                <svg viewBox="0 0 48 250" class="mt-6 w-10 overflow-visible">
                  <g
                    v-for="(p, i) in phases"
                    :key="p.id"
                    class="bs-trail"
                    :class="{ 'is-past': i < active, 'is-active': i === active }"
                    :transform="`translate(${i % 2 === 0 ? 0 : 24} ${206 - i * 41}) scale(0.19)`"
                  >
                    <Footprint :side="i % 2 === 0 ? 'left' : 'right'" variant="fill" />
                  </g>
                </svg>
              </div>
              <figure class="min-w-0 flex-1">
                <div class="mx-auto h-[72svh] max-h-[44rem] w-full max-w-[34rem]">
                  <BiomechStage :scene="current.scene" :transition="mode" :playing="stageVisible" />
                </div>
                <figcaption class="mt-2 text-center text-xs text-text-secondary">
                  {{ ILLUSTRATIVE_LABEL }}
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        <!-- Fases -->
        <ol class="bs-list relative lg:col-span-5">
          <li
            v-for="(phase, i) in phases"
            :key="phase.id"
            :ref="(el) => (items[i] = el as HTMLElement)"
            class="bs-item"
            :class="{ 'is-active': i === active }"
          >
            <article class="bs-card">
              <div class="bs-mobile-visual md:hidden" aria-hidden="true" data-mobile-visual :data-index="i">
                <BiomechStage
                  :scene="phase.scene"
                  :transition="mode === 'instant' ? 'instant' : 'morph'"
                  :lit="lit[i]"
                  :playing="playing[i]"
                />
              </div>
              <p class="bs-number font-display text-primary-strong">{{ phase.number }}</p>
              <h3 class="mt-2 text-heading-s font-semibold text-deep-blue">{{ phase.title }}</h3>
              <ContentValue :value="phase.text" as="p" class="mt-3 max-w-[44ch] text-text-secondary" />
              <NuxtLink
                v-if="phase.link"
                :to="phase.link.to"
                class="mt-4 inline-flex items-center gap-2 font-semibold text-primary-strong underline-offset-4 hover-fine:underline"
              >
                {{ phase.link.label }} <span aria-hidden="true">→</span>
              </NuxtLink>
            </article>
          </li>
        </ol>
      </div>
      <p class="mt-6 text-center text-xs text-text-secondary md:hidden">{{ ILLUSTRATIVE_LABEL }}</p>
    </div>
  </section>
</template>

<style scoped>
.bs-number {
  font-size: var(--text-display-m);
  line-height: 1;
}

/* Móvil: tarjetas unidas por una línea de recorrido vertical */
.bs-list {
  display: grid;
  gap: 2.5rem;
}
.bs-list::before {
  content: '';
  position: absolute;
  inset-block: 1rem;
  left: 50%;
  border-left: 1.5px dashed var(--color-ice-blue);
}
.bs-card {
  position: relative;
  border-radius: var(--radius-l);
  background: var(--color-white);
  padding: 1.5rem;
  box-shadow: var(--shadow-soft);
}
.bs-mobile-visual {
  margin: 0 auto 1rem;
  width: min(100%, 17rem);
  aspect-ratio: 400 / 520;
}

/* Tablet y escritorio: bloques de ~70 svh, sin tarjeta; el activo destaca */
@media (min-width: 768px) {
  .bs-list {
    gap: 0;
  }
  .bs-list::before {
    display: none;
  }
  .bs-item {
    display: flex;
    min-height: 70svh;
    align-items: center;
  }
  .bs-card {
    background: transparent;
    box-shadow: none;
    padding: 0;
    opacity: 0.35;
    transition: opacity 400ms ease;
  }
  .bs-item.is-active .bs-card {
    opacity: 1;
  }
  .bs-item:last-child {
    min-height: 90svh;
  }
}

.bs-trail {
  --fp-fill: var(--color-light-blue);
  transition: opacity 400ms ease;
}
.bs-trail.is-past {
  --fp-fill: var(--color-ice-blue);
}
.bs-trail.is-active {
  --fp-fill: var(--color-primary);
}
.bs-trail :deep(path),
.bs-trail :deep(ellipse) {
  transition: fill 400ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .bs-card,
  .bs-trail :deep(path),
  .bs-trail :deep(ellipse) {
    transition: none;
  }
}
</style>
