<script setup lang="ts">
/**
 * Fragmento de servicios de la Home (spec 03 §2). Propuesta visual (Fase 5).
 * - ≥ 1024: composición asimétrica (01 grande · 02 alta · 03 media · 04-05 filas editoriales).
 * - Tablet: 01 y 02 lado a lado, 03 a ancho completo, filas debajo.
 * - Móvil: lista vertical; el recurso se anima al entrar en viewport (no por hover).
 * Cada tarjeta es un único enlace.
 */
import { gsap } from 'gsap'
import { servicesSection } from '~/data/home'
import { servicePath, services } from '~/data/services'

const root = ref<HTMLElement | null>(null)
const featured = services.filter((s) => s.featured)
const rows = services.filter((s) => !s.featured)

const hovered = ref<string | null>(null)
const inView = ref<Set<string>>(new Set())
const finePointer = ref(false)
const isActive = (slug: string) => (finePointer.value ? hovered.value === slug : inView.value.has(slug))

let observer: IntersectionObserver | undefined
onMounted(() => {
  finePointer.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const slug = (e.target as HTMLElement).dataset.slug
        if (slug && e.isIntersecting) inView.value = new Set([...inView.value, slug])
      }
    },
    { threshold: 0.6 },
  )
  root.value?.querySelectorAll<HTMLElement>('[data-slug]').forEach((el) => observer?.observe(el))
})
onBeforeUnmount(() => observer?.disconnect())

/* Entrada `reveal` con stagger (spec 01 §8) */
useGsapContext(root, (c) => {
  if (c.reduce) return undefined
  gsap.from(root.value!.querySelectorAll('[data-reveal]'), {
    y: 32,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.08,
    scrollTrigger: { trigger: root.value, start: 'top 75%', once: true },
  })
  return undefined
})
</script>

<template>
  <section
    :id="servicesSection.id"
    ref="root"
    class="relative py-(--space-section)"
    aria-labelledby="servicios-title"
  >
    <div class="container-site">
      <p class="eyebrow text-primary-strong" data-reveal>Servicios</p>
      <h2
        id="servicios-title"
        class="mt-4 max-w-[16ch] font-display text-display-l text-deep-blue"
        data-reveal
      >
        {{ servicesSection.title.before }}<em class="text-primary">{{ servicesSection.title.accent }}</em
        >{{ servicesSection.title.after }}
      </h2>

      <ul class="services-grid mt-14" role="list">
        <li v-for="(service, i) in featured" :key="service.slug" :class="`card-${i + 1}`" data-reveal>
          <NuxtLink
            :to="servicePath(service.slug)"
            class="service-card"
            :data-slug="service.slug"
            @pointerenter="hovered = service.slug"
            @pointerleave="hovered = null"
            @focus="hovered = service.slug"
            @blur="hovered = null"
          >
            <div class="card-graphic">
              <ServiceGraphic :kind="service.graphic" :active="isActive(service.slug)" />
            </div>
            <div class="card-text">
              <span class="font-display text-heading-s text-primary">{{ service.number }}</span>
              <h3 class="mt-2 font-display text-display-m text-deep-blue">{{ service.name }}</h3>
              <ContentValue :value="service.summary" as="p" class="mt-3 max-w-[38ch] text-text-secondary" />
              <span class="card-more">
                Ver servicio
                <svg viewBox="0 0 16 16" class="size-4" fill="none" aria-hidden="true">
                  <path
                    d="M2 8h11M9 3.5 13.5 8 9 12.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </div>
          </NuxtLink>
        </li>

        <li class="card-rows" data-reveal>
          <ul role="list">
            <li v-for="service in rows" :key="service.slug">
              <NuxtLink
                :to="servicePath(service.slug)"
                class="service-row"
                :data-slug="service.slug"
                @pointerenter="hovered = service.slug"
                @pointerleave="hovered = null"
                @focus="hovered = service.slug"
                @blur="hovered = null"
              >
                <span class="font-display text-heading-s text-primary">{{ service.number }}</span>
                <span class="row-graphic">
                  <ServiceGraphic :kind="service.graphic" :active="isActive(service.slug)" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block font-display text-heading-s text-deep-blue">{{ service.name }}</span>
                  <ContentValue :value="service.summary" class="block text-sm text-text-secondary" />
                </span>
                <svg viewBox="0 0 16 16" class="row-arrow size-5" fill="none" aria-hidden="true">
                  <path
                    d="M2 8h11M9 3.5 13.5 8 9 12.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </NuxtLink>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.services-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}
@media (min-width: 768px) {
  .services-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
  }
  .card-3,
  .card-rows {
    grid-column: 1 / -1;
  }
}
@media (min-width: 1024px) {
  .services-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-auto-rows: minmax(0, auto);
  }
  .card-1 {
    grid-column: 1 / span 7;
  }
  .card-2 {
    grid-column: 8 / span 5;
    grid-row: span 1;
  }
  .card-3 {
    grid-column: 1 / span 5;
  }
  .card-rows {
    grid-column: 6 / span 7;
    align-self: stretch;
  }
}

.service-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-radius: var(--radius-l);
  border: 1px solid var(--color-border);
  background:
    radial-gradient(70% 60% at 80% 10%, rgb(185 229 243 / 0.5), transparent 70%), var(--color-white);
  padding: clamp(1.25rem, 2.5vw, 2rem);
  transition:
    transform var(--dur-base) var(--ease-out-soft),
    border-color var(--dur-base) var(--ease-out-soft),
    box-shadow var(--dur-base) var(--ease-out-soft);
}
.card-graphic {
  height: clamp(180px, 22vw, 280px);
  padding-block: 0.5rem 1.5rem;
}
.card-1 .card-graphic {
  height: clamp(200px, 26vw, 340px);
}
@media (min-width: 1024px) {
  .card-1 .service-card {
    flex-direction: row-reverse;
    align-items: flex-end;
    gap: 2rem;
  }
  .card-1 .card-graphic {
    flex: 0 0 44%;
    height: 360px;
    padding: 0;
  }
  .card-1 .card-text {
    flex: 1;
  }
  .card-3 .service-card {
    flex-direction: row-reverse;
    align-items: flex-end;
    gap: 1rem;
  }
  .card-3 .card-graphic {
    flex: 0 0 40%;
    height: 200px;
    padding: 0;
  }
}
.card-more {
  margin-top: 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary-strong);
}
@media (hover: hover) and (pointer: fine) {
  .card-more {
    opacity: 0;
    transform: translateX(-8px);
    transition:
      opacity var(--dur-base) var(--ease-out-soft),
      transform var(--dur-base) var(--ease-out-soft);
  }
  .service-card:hover,
  .service-card:focus-visible {
    transform: scale(1.02);
    border-color: rgb(18 112 182 / 0.4);
    box-shadow: var(--shadow-float);
  }
  .service-card:hover .card-more,
  .service-card:focus-visible .card-more {
    opacity: 1;
    transform: none;
  }
}

/* Filas editoriales (04, 05) */
.card-rows > ul {
  display: grid;
  height: 100%;
  align-content: center;
  border-top: 1px solid var(--color-border);
}
.service-row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border-bottom: 1px solid var(--color-border);
  padding: 1.5rem 0.5rem;
  transition: background-color var(--dur-base) var(--ease-out-soft);
}
.row-graphic {
  flex: none;
  width: 64px;
  height: 56px;
}
.row-arrow {
  flex: none;
  color: var(--color-primary);
  transition: transform var(--dur-base) var(--ease-out-soft);
}
@media (hover: hover) and (pointer: fine) {
  .service-row:hover,
  .service-row:focus-visible {
    background: rgb(234 245 250 / 0.7);
  }
  .service-row:hover .row-arrow,
  .service-row:focus-visible .row-arrow {
    transform: translateX(6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .service-card,
  .card-more,
  .row-arrow {
    transition: none;
  }
  .service-card:hover {
    transform: none;
  }
}
</style>
