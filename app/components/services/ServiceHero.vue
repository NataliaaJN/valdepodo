<script setup lang="ts">
/**
 * Cabecera de página de servicio, en dos tiempos:
 *  1. Fotografía del servicio a sangre (mismo tratamiento monocromo azul que las piezas de la Home) con su
 *     nombre monumental apoyado abajo a la izquierda y el número a la derecha.
 *  2. «Hoja» de hueso: la frase del servicio como titular, la descripción, la acción y —a la derecha— el
 *     recurso visual propio (SVG, póster 3D…) en el slot.
 * La fotografía sale de `app/data/service-media.ts` (único punto de sustitución de las imágenes).
 */
import { gsap } from 'gsap'
import type { Maybe } from '#shared/utils/pending'
import type { Headline } from '#shared/types/content'
import { getServiceMedia, mediaSrcset } from '~/data/service-media'
import { bookingPath, type Service } from '~/data/services'

const props = withDefaults(
  defineProps<{
    service: Service
    /** Frase del servicio (titular de la hoja). */
    title?: Headline
    /** Alternativa a `title` para frases con contenido pendiente de validar. */
    statement?: Maybe<string>
    description: Maybe<string>
    ctaLabel?: string
  }>(),
  { title: undefined, statement: undefined, ctaLabel: 'Pedir cita' },
)
defineSlots<{ default?: () => unknown; caption?: () => unknown }>()

const media = computed(() => getServiceMedia(props.service.slug))
const srcset = computed(() => mediaSrcset(media.value.src, [800, 1280, 1600]))
const titleText = computed(() =>
  props.title ? `${props.title.before}${props.title.accent ?? ''}${props.title.after ?? ''}` : '',
)

const root = ref<HTMLElement | null>(null)
useGsapContext(root, (c) => {
  if (!c.desktop || c.reduce || !root.value) return undefined
  gsap.to(root.value.querySelector('[data-parallax]'), {
    yPercent: 10,
    ease: 'none',
    scrollTrigger: { trigger: root.value, start: 'top top', end: 'bottom top', scrub: true },
  })
  return undefined
})
</script>

<template>
  <div ref="root">
    <header class="hero chapter-ink section-clip relative isolate" data-nav-theme="ink">
      <div class="hero__media photo-duo" aria-hidden="true">
        <img
          data-parallax
          :src="media.src"
          :srcset="srcset"
          sizes="100vw"
          :alt="media.alt ?? ''"
          :style="{ objectPosition: media.focus }"
          fetchpriority="high"
          decoding="async"
        />
        <span class="hero__scrim" />
      </div>

      <div class="container-wide hero__inner">
        <SiteBreadcrumbs
          :items="[
            { name: 'Inicio', to: '/' },
            { name: 'Servicios', to: '/servicios' },
            { name: service.name },
          ]"
          class="hero__crumbs"
        />
        <div class="hero__bottom">
          <h1 id="service-title" class="hero__name mega">{{ service.name }}</h1>
          <p class="hero__num eyebrow">({{ service.number }}) / 05</p>
        </div>
      </div>
    </header>

    <section class="chapter-bone sheet" data-nav-theme="bone" aria-label="Presentación del servicio">
      <div class="container-wide sheet__grid">
        <div class="sheet__text">
          <ContentValue
            v-if="statement"
            v-reveal
            :value="statement"
            as="p"
            class="sheet__statement text-display-m"
          />
          <p v-else-if="titleText" v-reveal class="sheet__statement text-display-m">{{ titleText }}</p>
          <ContentValue
            v-reveal="1"
            :value="description"
            as="p"
            class="sheet__desc measure text-body-l text-text-secondary"
          />
          <div v-reveal="2" class="mt-8 flex flex-wrap gap-3">
            <BaseButton :to="bookingPath(service.slug)" arrow>{{ ctaLabel }}</BaseButton>
          </div>
        </div>
        <figure v-if="$slots.default" class="sheet__visual">
          <slot />
          <figcaption v-if="$slots.caption" class="mt-3 text-center text-xs text-text-secondary">
            <slot name="caption" />
          </figcaption>
        </figure>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  display: flex;
  min-height: min(82svh, 58rem);
  background: var(--color-ink);
}
.hero__media {
  position: absolute;
  inset: 0;
  z-index: -1;
}
.hero__media img {
  position: absolute;
  inset: -6% 0 -6%;
  width: 100%;
  height: 112%;
  max-width: none;
  object-fit: cover;
}
.hero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgb(6 26 44 / 0.85) 0%,
    rgb(6 26 44 / 0.2) 50%,
    rgb(6 26 44 / 0.35) 100%
  );
}
.hero__inner {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: calc(var(--nav-h) + 1rem);
  padding-bottom: clamp(1.5rem, 3vw, 3rem);
}
.hero__crumbs {
  color: var(--color-ice-blue);
}
.hero__bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem 2rem;
  padding-top: 4rem;
}
.hero__name {
  max-width: 11ch;
  font-size: clamp(3.25rem, 1rem + 11.5vw, 11.5rem);
  line-height: 0.84;
  color: var(--color-bone);
  text-wrap: balance;
}
.hero__num {
  color: var(--color-bone);
  font-variant-numeric: tabular-nums;
}

.sheet {
  padding-block: clamp(3.5rem, 8vw, 8rem);
}
.sheet__grid {
  display: grid;
  gap: 3rem;
}
.sheet__statement {
  max-width: 18ch;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: -0.035em;
}
.sheet__desc {
  margin-top: 1.5rem;
}
.sheet__visual {
  align-self: center;
}
@media (min-width: 1024px) {
  .sheet__grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
    align-items: start;
  }
  .sheet__text {
    grid-column: 1 / span 6;
  }
  .sheet__visual {
    grid-column: 8 / span 5;
  }
}
</style>
