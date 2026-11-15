<script setup lang="ts">
/**
 * «Otros servicios»: cierre ligero de las páginas de servicio (antes, un bloque de tinta con dos piezas grandes).
 * Muestra TODOS los demás servicios en una tira horizontal con `scroll-snap` nativo: se arrastra o desliza con
 * el dedo, el teclado la recorre con el foco (cada tarjeta es un enlace) y las flechas la mueven una tarjeta.
 * Cuando caben todas (escritorio ancho) las flechas desaparecen. Movimiento mínimo: la foto hace zoom 1,03 al
 * señalar y las flechas se hunden al pulsar; el desplazamiento lo anima el navegador (interrumpible).
 */
import { getServiceMedia, mediaSrcset } from '~/data/service-media'
import { servicePath, services } from '~/data/services'

const props = defineProps<{ current: string }>()

const items = computed(() =>
  services
    .filter((s) => s.slug !== props.current)
    .map((s) => {
      const media = getServiceMedia(s.slug)
      return { service: s, media, srcset: mediaSrcset(media.src, [480, 800]) }
    }),
)

const track = ref<HTMLElement | null>(null)
const canPrev = ref(false)
const canNext = ref(false)
const overflows = ref(false)

function update() {
  const el = track.value
  if (!el) return
  overflows.value = el.scrollWidth - el.clientWidth > 2
  canPrev.value = el.scrollLeft > 2
  canNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
}

function step(dir: 1 | -1) {
  const el = track.value
  if (!el) return
  const card = el.querySelector<HTMLElement>('li')
  const gap = parseFloat(getComputedStyle(el).columnGap) || 0
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollBy({ left: dir * ((card?.offsetWidth ?? 280) + gap), behavior: reduce ? 'auto' : 'smooth' })
}

let observer: ResizeObserver | undefined
onMounted(() => {
  update()
  if ('ResizeObserver' in window && track.value) {
    observer = new ResizeObserver(update)
    observer.observe(track.value)
  }
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section class="others" aria-labelledby="others-title" data-nav-theme="bone">
    <div class="container-wide">
      <div class="others__head">
        <h2 id="others-title" v-reveal class="others__title">Otros servicios</h2>
        <div v-if="overflows" class="others__nav">
          <button type="button" class="arrow" :disabled="!canPrev" @click="step(-1)">
            <BaseIcon name="arrow-left" class="size-5" />
            <span class="sr-only">Servicios anteriores</span>
          </button>
          <button type="button" class="arrow" :disabled="!canNext" @click="step(1)">
            <BaseIcon name="arrow-right" class="size-5" />
            <span class="sr-only">Servicios siguientes</span>
          </button>
        </div>
      </div>

      <ul ref="track" class="track" role="list" @scroll.passive="update">
        <li v-for="{ service, media, srcset } in items" :key="service.slug" class="card">
          <NuxtLink :to="servicePath(service.slug)" class="card__link">
            <span class="card__photo">
              <img
                :src="media.src"
                :srcset="srcset"
                sizes="(min-width: 1024px) 18rem, 70vw"
                alt=""
                width="800"
                height="600"
                loading="lazy"
                decoding="async"
                draggable="false"
                :style="{ objectPosition: media.focus }"
              />
            </span>
            <span class="card__name">{{ service.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.others {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
  padding-block: clamp(2.5rem, 5vw, 4rem);
}
.others__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.others__title {
  font-size: var(--text-heading-s);
  line-height: 1.15;
  color: var(--color-ink);
}
.others__nav {
  display: flex;
  gap: 0.5rem;
}
.arrow {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-s);
  color: var(--color-ink);
  transition:
    background-color 160ms var(--ease-out),
    color 160ms var(--ease-out),
    transform 160ms var(--ease-out),
    opacity 160ms var(--ease-out);
}
.arrow:active:not(:disabled) {
  transform: scale(0.97);
}
.arrow:disabled {
  opacity: 0.35;
  cursor: default;
}

/* Tira con snap: el navegador anima y permite interrumpir el desplazamiento */
.track {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  margin-inline: calc(-1 * var(--gutter));
  padding-inline: var(--gutter);
  scroll-padding-inline: var(--gutter);
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.track::-webkit-scrollbar {
  display: none;
}
.card {
  flex: 0 0 min(70vw, 18rem);
  scroll-snap-align: start;
}
@media (min-width: 1024px) {
  /* Con cuatro tarjetas caben todas en una fila a ancho completo */
  .card {
    flex: 1 0 15.5rem;
  }
}
.card__link {
  display: block;
}
.card__photo {
  display: block;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-m);
  background: var(--color-bone-2);
  transform: translateZ(0);
}
.card__photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: scale 500ms var(--ease-out);
}
.card__name {
  display: inline-block;
  margin-top: 0.75rem;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.125rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 5px;
  text-decoration-color: transparent;
  transition: text-decoration-color 200ms var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .arrow:hover:not(:disabled) {
    background: var(--color-ink);
    color: var(--color-bone);
  }
  .card__link:hover .card__photo img {
    scale: 1.03;
  }
  .card__link:hover .card__name {
    text-decoration-color: currentColor;
  }
}
@media (prefers-reduced-motion: reduce) {
  .arrow,
  .card__photo img,
  .card__name {
    transition-duration: 1ms;
  }
  .card__link:hover .card__photo img {
    scale: 1;
  }
}
</style>
