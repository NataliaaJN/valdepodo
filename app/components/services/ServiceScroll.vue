<script setup lang="ts">
/**
 * Recorrido de servicios para la página /servicios.
 * Escritorio: línea de tiempo a la izquierda (un servicio por «pantalla») e imagen fija a la derecha que
 * cambia con cada servicio al hacer scroll. Móvil/tablet: cada servicio es un bloque con su imagen.
 * Sin GSAP: `position: sticky` + IntersectionObserver. Paleta propia de marca declarada en `.svc`.
 */
import { getServiceMedia, mediaSrcset } from '~/data/service-media'
import { servicePath, services } from '~/data/services'

const active = ref(0)
const steps = ref<HTMLElement[]>([])
const list = ref<HTMLElement | null>(null)
const progress = ref(0)

let observer: IntersectionObserver | undefined
let raf = 0

function updateProgress() {
  raf = 0
  const el = list.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const mid = window.innerHeight * 0.5
  progress.value = Math.min(1, Math.max(0, (mid - r.top) / r.height))
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) active.value = Number((entry.target as HTMLElement).dataset.index)
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  )
  steps.value.forEach((s) => observer!.observe(s))
  updateProgress()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})
function onScroll() {
  if (!raf) raf = requestAnimationFrame(updateProgress)
}
onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  if (raf) cancelAnimationFrame(raf)
})

const media = services.map((s) => {
  const m = getServiceMedia(s.slug)
  return { ...m, srcset: mediaSrcset(m.src) }
})
</script>

<template>
  <div class="svc">
    <div class="svc__inner container-wide">
      <ol ref="list" class="svc__list" role="list" :style="{ '--progress': progress }">
        <li
          v-for="(service, i) in services"
          :id="`svc-${service.slug}`"
          :key="service.slug"
          :ref="(el) => { if (el) steps[i] = el as HTMLElement }"
          class="step"
          :class="{ 'is-active': active === i, 'is-past': active > i }"
          :data-index="i"
        >
          <span class="step__dot" aria-hidden="true" />

          <div class="step__body">
            <h2 class="step__name">{{ service.name }}</h2>
            <ContentValue :value="service.description" as="p" class="step__desc" />
            <div class="step__actions">
              <NuxtLink :to="servicePath(service.slug)" class="step__more">
                Saber más<span class="sr-only">: {{ service.name }}</span>
                <BaseIcon name="arrow-right" class="step__more-icon" />
              </NuxtLink>
            </div>
          </div>

          <!-- Imagen en línea (móvil y tablet) -->
          <div class="step__photo" aria-hidden="true">
            <img
              :src="media[i]!.src"
              :srcset="media[i]!.srcset"
              sizes="(min-width: 640px) 560px, 100vw"
              alt=""
              loading="lazy"
              decoding="async"
              :style="{ objectPosition: media[i]!.focus }"
            />
          </div>
        </li>
      </ol>

      <!-- Imagen fija (escritorio) -->
      <div class="svc__stage" aria-hidden="true">
        <div class="stage">
          <img
            v-for="(m, i) in media"
            :key="services[i]!.slug"
            class="stage__img"
            :class="{ 'is-on': active === i }"
            :src="m.src"
            :srcset="m.srcset"
            sizes="(min-width: 1024px) 45vw, 0px"
            alt=""
            :loading="i === 0 ? 'eager' : 'lazy'"
            decoding="async"
            :style="{ objectPosition: m.focus }"
          />
          <span class="stage__veil" />
          <span class="stage__counter">
            <b>{{ services[active]?.number }}</b> / {{ String(services.length).padStart(2, '0') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.svc {
  --b-main: #087ead;
  --b-cyan: #00a9d0;
  --b-deep: #163c63;
  --b-ice: #b9e5f3;
  --b-pale: #eaf5fa;
  --b-mist: #f5f8fc;
  --b-text: #24364b;
  background: linear-gradient(180deg, var(--b-mist) 0%, var(--b-pale) 100%);
  color: var(--b-text);
  padding-block: clamp(3rem, 7vw, 6rem);
}
.svc__inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

/* ---------- Línea de tiempo ---------- */
.svc__list {
  position: relative;
  --progress: 0;
}
.svc__list::before,
.svc__list::after {
  content: '';
  position: absolute;
  left: 0.4375rem;
  top: 1.1rem;
  bottom: 1.1rem;
  width: 2px;
  border-radius: 2px;
}
.svc__list::before {
  background: var(--b-ice);
}
.svc__list::after {
  background: var(--b-main);
  transform-origin: top;
  transform: scaleY(var(--progress));
}

.step {
  position: relative;
  display: grid;
  gap: 1.5rem;
  padding: 0 0 clamp(2.5rem, 6vw, 4rem) 2.25rem;
}
.step + .step {
  border-top: 1px solid rgb(8 126 173 / 0.14);
  padding-top: clamp(2.5rem, 6vw, 4rem);
}
.step__dot {
  position: absolute;
  left: 0;
  top: 0.4rem;
  width: 0.9375rem;
  height: 0.9375rem;
  border-radius: 50%;
  background: var(--b-mist);
  border: 2px solid var(--b-main);
  z-index: 1;
  transition:
    background-color 400ms ease,
    box-shadow 400ms ease;
}
.step + .step .step__dot {
  top: calc(clamp(2.5rem, 6vw, 4rem) + 0.4rem);
}
.step.is-past .step__dot,
.step.is-active .step__dot {
  background: var(--b-main);
}
.step.is-active .step__dot {
  box-shadow: 0 0 0 6px rgb(0 169 208 / 0.22);
}

.step__name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(2rem, 1.2rem + 2.6vw, 3.5rem);
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--b-deep);
  text-wrap: balance;
}
.step__desc {
  margin-top: 1.5rem;
  max-width: 34ch;
  font-size: clamp(1.25rem, 1rem + 0.9vw, 1.75rem);
  line-height: 1.45;
  color: var(--b-text);
}
.step__actions {
  margin-top: 1.75rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.75rem;
}
.step__more {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--b-main);
  transition: color 250ms ease;
}
.step__more-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 250ms ease;
}
.step__more:focus-visible {
  outline: 2px solid var(--b-cyan);
  outline-offset: 4px;
  border-radius: 4px;
}
@media (hover: hover) and (pointer: fine) {
  .step__more:hover {
    color: var(--b-deep);
  }
  .step__more:hover .step__more-icon {
    transform: translateX(4px);
  }
}

.step__photo {
  overflow: hidden;
  border-radius: 12px;
  aspect-ratio: 4 / 3;
  background: var(--b-ice);
}
.step__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.svc__stage {
  display: none;
}

/* ---------- Escritorio: imagen fija + texto que pasa ---------- */
@media (min-width: 1024px) {
  .svc {
    padding-block: 0;
  }
  .svc__inner {
    grid-template-columns: minmax(0, 6fr) minmax(0, 5fr);
    column-gap: clamp(3rem, 6vw, 7rem);
    align-items: start;
  }
  .svc__list::before,
  .svc__list::after {
    top: 50vh;
    bottom: 50vh;
  }
  .step,
  .step + .step {
    min-height: 100vh;
    align-content: center;
    border-top: 0;
    padding: 6rem 0 6rem 3rem;
    opacity: 0.28;
    transition: opacity 500ms ease;
  }
  .step.is-active {
    opacity: 1;
  }
  .step__dot,
  .step + .step .step__dot {
    top: 50%;
    margin-top: -0.46875rem;
  }
  .step__photo {
    display: none;
  }
  .svc__list::before,
  .svc__list::after {
    left: 0.4375rem;
  }
  .svc__stage {
    display: block;
    position: sticky;
    top: 0;
    height: 100vh;
    padding-block: clamp(5.5rem, 12vh, 8rem);
  }
  .stage {
    position: relative;
    height: 100%;
    overflow: hidden;
    border-radius: 16px;
    background: var(--b-ice);
    box-shadow: 0 30px 60px -30px rgb(22 60 99 / 0.45);
  }
  .stage__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    scale: 1.06;
    transition:
      opacity 700ms ease,
      scale 1400ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .stage__img.is-on {
    opacity: 1;
    scale: 1;
  }
  .stage__veil {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to top, rgb(22 60 99 / 0.55) 0%, transparent 40%),
      linear-gradient(135deg, rgb(8 126 173 / 0.12), transparent 60%);
    pointer-events: none;
  }
  .stage__counter {
    position: absolute;
    left: 1.5rem;
    bottom: 1.25rem;
    color: var(--b-mist);
    font-size: 0.9375rem;
    letter-spacing: 0.04em;
    font-variant-numeric: tabular-nums;
  }
  .stage__counter b {
    font-size: 1.5rem;
    font-weight: 600;
  }
}

@media (min-width: 640px) and (max-width: 1023px) {
  .step {
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.8fr);
    column-gap: 2rem;
    align-items: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stage__img,
  .step,
  .step__dot {
    transition: none;
  }
  .stage__img {
    scale: 1;
  }
  .svc__list::after {
    transition: none;
  }
}
</style>
