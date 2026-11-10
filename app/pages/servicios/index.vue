<script setup lang="ts">
/**
 * Índice de servicios (spec 04 §0). Cinco bloques editoriales, no una rejilla de tarjetas iguales:
 * alternan el lado del recurso gráfico, uno va a sangre sobre light-blue y el último es compacto.
 * Móvil: lista vertical, recurso arriba y texto debajo, todo visible.
 * Animación: `reveal` + leve parallax del recurso (≤ 40 px, solo ≥ 1024 y sin reduced motion).
 */
import { gsap } from 'gsap'
import { bookingPath, servicePath, services } from '~/data/services'

usePageSeo({
  title: 'Servicios de podología',
  description:
    'Estudio biomecánico, plantillas personalizadas, podología general, podología infantil y pie diabético en Valdepodo.',
  path: '/servicios',
})
useBreadcrumbSchema([
  { name: 'Inicio', path: '/' },
  { name: 'Servicios', path: '/servicios' },
])

/* Composición de cada bloque */
const layout = ['split', 'bleed', 'split-reverse', 'split', 'compact'] as const

const root = ref<HTMLElement | null>(null)
useGsapContext(root, (c) => {
  if (!c.desktop || c.reduce) return undefined
  root.value!.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    gsap.fromTo(
      el,
      { y: 40 },
      {
        y: -40,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      },
    )
  })
  return undefined
})

const hovered = ref<string | null>(null)
</script>

<template>
  <div ref="root">
    <section class="section-clip relative isolate" aria-labelledby="services-title">
      <div
        class="pointer-events-none absolute inset-0 -z-10 bg-(image:--grad-atmosphere)"
        aria-hidden="true"
      />
      <div class="container-site pt-8 lg:pt-10">
        <SiteBreadcrumbs :items="[{ name: 'Inicio', to: '/' }, { name: 'Servicios' }]" />
      </div>
      <div class="container-site pt-10 pb-12 lg:pt-16 lg:pb-20">
        <p class="eyebrow text-primary-strong">Servicios</p>
        <h1 id="services-title" class="mt-4 max-w-[16ch] font-display text-display-l text-deep-blue">
          Soluciones para cuidar de tus <em class="text-primary">pies</em>.
        </h1>
      </div>
    </section>

    <ol class="service-blocks" role="list">
      <li
        v-for="(service, i) in services"
        :key="service.slug"
        class="service-block"
        :class="`is-${layout[i]}`"
        @pointerenter="hovered = service.slug"
        @pointerleave="hovered = null"
      >
        <div class="container-site block-grid">
          <div class="block-graphic" aria-hidden="true">
            <div data-parallax class="h-full">
              <ServiceGraphic :kind="service.graphic" :active="hovered === service.slug" />
            </div>
          </div>
          <div class="block-text">
            <span v-reveal class="font-display text-heading-s text-primary">{{ service.number }}</span>
            <h2 v-reveal class="mt-2 font-display text-display-m text-deep-blue">
              <NuxtLink :to="servicePath(service.slug)" class="block-title-link">{{ service.name }}</NuxtLink>
            </h2>
            <ContentValue
              v-reveal="1"
              :value="service.description"
              as="p"
              class="measure mt-4 text-body-l text-text-secondary"
            />
            <div v-reveal="2" class="mt-6">
              <h3 class="eyebrow text-deep-blue">Te ayuda si…</h3>
              <ul class="needs mt-3 grid gap-2" role="list">
                <li v-for="(need, n) in service.needs" :key="n" class="flex gap-3">
                  <BaseIcon name="check" class="mt-1 size-4 text-primary" />
                  <ContentValue :value="need" />
                </li>
              </ul>
            </div>
            <div v-reveal="3" class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <BaseButton :to="servicePath(service.slug)" variant="secondary" arrow>
                Ver servicio<span class="sr-only">: {{ service.name }}</span>
              </BaseButton>
              <BaseButton :to="bookingPath(service.slug)" variant="ghost">
                Pedir cita<span class="sr-only"> para {{ service.name.toLowerCase() }}</span>
              </BaseButton>
            </div>
          </div>
        </div>
      </li>
    </ol>

    <CtaBlock
      :title="{ before: '¿No sabes qué necesita ', accent: 'tu pie', after: '?' }"
      :cta="{ label: 'Pedir cita', to: '/pedir-cita' }"
    />
  </div>
</template>

<style scoped>
.service-block {
  padding-block: clamp(3rem, 6vw, 6rem);
  border-top: 1px solid var(--color-border);
}
.block-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
}
.block-graphic {
  height: clamp(200px, 50vw, 300px);
}
.is-bleed {
  background:
    radial-gradient(60% 80% at 85% 30%, rgb(185 229 243 / 0.65), transparent 70%), var(--color-light-blue);
  border-top: 0;
}
.block-title-link {
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 8px;
  text-decoration-thickness: 1.5px;
  transition: text-decoration-color var(--dur-fast) var(--ease-out-soft);
}
.block-title-link:hover {
  text-decoration-color: currentColor;
}

@media (min-width: 768px) {
  .block-grid {
    grid-template-columns: repeat(8, minmax(0, 1fr));
    align-items: center;
  }
  .block-graphic {
    grid-column: 1 / span 3;
    height: 280px;
  }
  .block-text {
    grid-column: 4 / span 5;
  }
  .is-split-reverse .block-graphic {
    grid-column: 6 / span 3;
    grid-row: 1;
  }
  .is-split-reverse .block-text {
    grid-column: 1 / span 5;
    grid-row: 1;
  }
}

@media (min-width: 1024px) {
  .block-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
  .block-graphic {
    grid-column: 1 / span 5;
    height: 380px;
  }
  .block-text {
    grid-column: 7 / span 6;
  }
  .is-bleed .block-graphic {
    grid-column: 7 / span 6;
    grid-row: 1;
    height: 440px;
  }
  .is-bleed .block-text {
    grid-column: 1 / span 5;
    grid-row: 1;
  }
  .is-split-reverse .block-graphic {
    grid-column: 8 / span 5;
  }
  .is-split-reverse .block-text {
    grid-column: 1 / span 6;
  }
  .is-compact .block-graphic {
    grid-column: 2 / span 3;
    height: 260px;
  }
  .is-compact .block-text {
    grid-column: 6 / span 6;
  }
}
</style>
