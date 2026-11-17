<script setup lang="ts">
/**
 * Pieza visual de un servicio: fotografía + nombre. Sin descripción. Un único enlace a su página.
 *
 * Interacción (referencia de ritmo: galerías de imagen de Kexsio, sin copiar su diseño):
 *  - Reposo: foto en monocromo azul de marca (tratamiento común, independiente de la foto de origen).
 *  - Hover / foco: el color vuelve, zoom lento 1,00 → 1,07 (1,4 s, expo-out), la imagen se desplaza en
 *    sentido contrario al puntero (≤ 18 px, con inercia → profundidad) y el título sube unos píxeles
 *    (sin cambiar de color).
 *  - Táctil (sin hover): la pieza que cruza el centro de la pantalla se «activa» con la misma animación.
 *  - Reduced motion: sin zoom ni desplazamiento; cambian el color de la foto y el del título.
 * La imagen sale de `app/data/service-media.ts` (único punto de sustitución).
 */
import { getServiceMedia, mediaSrcset } from '~/data/service-media'
import { servicePath, type Service } from '~/data/services'

const props = withDefaults(
  defineProps<{
    service: Service
    /** Escala del título. */
    size?: 'xl' | 'l' | 'm'
    /** Atributo `sizes` de la imagen (ancho aproximado de la pieza en cada breakpoint). */
    sizes?: string
    eager?: boolean
  }>(),
  { size: 'm', sizes: '(min-width: 1024px) 40vw, 100vw', eager: false },
)

const media = computed(() => getServiceMedia(props.service.slug))
const srcset = computed(() => mediaSrcset(media.value.src))

const root = ref<{ $el: HTMLElement } | HTMLElement | null>(null)
const el = () => (root.value && '$el' in root.value ? root.value.$el : root.value) as HTMLElement | null

const touchActive = ref(false)
const focused = ref(false)
const active = computed(() => touchActive.value || focused.value)

let observer: IntersectionObserver | undefined
onMounted(() => {
  const target = el()
  if (!target || window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  // Banda central del 20 % de la altura: la pieza que la cruza queda activa
  observer = new IntersectionObserver(([entry]) => (touchActive.value = !!entry?.isIntersecting), {
    rootMargin: '-40% 0px -40% 0px',
  })
  observer.observe(target)
})
onBeforeUnmount(() => observer?.disconnect())

const MAX_SHIFT = 18
function onPointerMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  const target = el()
  if (!target) return
  const r = target.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width - 0.5
  const y = (e.clientY - r.top) / r.height - 0.5
  target.style.setProperty('--px', `${(-x * MAX_SHIFT * 2).toFixed(1)}px`)
  target.style.setProperty('--py', `${(-y * MAX_SHIFT * 2).toFixed(1)}px`)
}
function onPointerLeave() {
  el()?.style.setProperty('--px', '0px')
  el()?.style.setProperty('--py', '0px')
}
</script>

<template>
  <NuxtLink
    ref="root"
    :to="servicePath(service.slug)"
    class="tile"
    :class="[`tile--${size}`, { 'is-active': active }]"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
    @focus="focused = true"
    @blur="focused = false"
  >
    <span class="tile__media" aria-hidden="true">
      <img
        class="tile__img"
        :src="publicUrl(media.src)"
        :srcset="srcset"
        :sizes="srcset ? sizes : undefined"
        :alt="media.alt ?? ''"
        :style="{ objectPosition: media.focus }"
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
        draggable="false"
      />
      <span class="tile__tint" />
      <span class="tile__scrim" />
    </span>

    <span class="tile__top">
      <span class="tile__go">
        <BaseIcon name="arrow-up-right" class="tile__go-icon" />
      </span>
    </span>

    <span class="tile__title">{{ service.name }}</span>
  </NuxtLink>
</template>

<style scoped>
.tile {
  --px: 0px;
  --py: 0px;
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  min-height: 12rem;
  overflow: hidden;
  border-radius: var(--radius-m);
  background: var(--color-ink);
  color: var(--color-bone);
  padding: clamp(1rem, 1.6vw, 1.5rem);
  /* Safari: recorte con radio también durante las transformaciones de los hijos */
  transform: translateZ(0);
}

/* ---------- Fotografía: tratamiento común ---------- */
.tile__media {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}
.tile__img {
  position: absolute;
  inset: -5%;
  width: 110%;
  height: 110%;
  max-width: none;
  object-fit: cover;
  filter: grayscale(1) contrast(1.08) brightness(1.05);
  scale: 1.01;
  translate: var(--px) var(--py);
  transition:
    scale var(--dur-image) var(--ease-out-soft),
    translate 1100ms var(--ease-out-soft),
    filter 1000ms var(--ease-out-soft);
  will-change: scale, translate;
}
/* Capa de color de marca en multiply: monocromo azul en reposo */
.tile__tint {
  position: absolute;
  inset: 0;
  /* Mismo tono que los botones (cyan claro): filtro suave en vez del cyan saturado */
  background: var(--color-cyan-light);
  mix-blend-mode: multiply;
  opacity: 0.95;
  transition: opacity 1000ms var(--ease-out-soft);
}
/* Velo solo bajo el texto: garantiza el contraste del título (AA) en cualquier foto */
.tile__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(6 26 44 / 0.78) 0%, rgb(6 26 44 / 0.25) 38%, transparent 62%);
}

/* ---------- Texto ---------- */
.tile__top {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 1rem;
}
.tile__num {
  font-size: var(--text-eyebrow);
  letter-spacing: var(--text-eyebrow--letter-spacing);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.tile__go {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  overflow: hidden;
  border: 1px solid rgb(241 239 233 / 0.45);
  border-radius: var(--radius-m);
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft),
    border-color var(--dur-base) var(--ease-out-soft);
}
.tile__go-icon {
  width: 1.125rem;
  height: 1.125rem;
  transition: transform var(--dur-base) var(--ease-out-soft);
}
.tile__title {
  max-width: 14ch;
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 0.96;
  text-wrap: balance;
  color: var(--color-bone);
  transition:
    color var(--dur-base) var(--ease-out-soft),
    transform var(--dur-image) var(--ease-out-soft);
}
.tile--xl .tile__title {
  font-size: clamp(2rem, 1rem + 2.6vw, 3.5rem);
}
.tile--l .tile__title {
  font-size: clamp(1.75rem, 1rem + 2vw, 2.75rem);
}
.tile--m .tile__title {
  font-size: clamp(1.5rem, 1rem + 1.3vw, 2.25rem);
}

/* ---------- Estado activo (hover, foco o centro de pantalla en táctil) ---------- */
.is-active .tile__img,
.tile:focus-visible .tile__img {
  filter: grayscale(0) contrast(1.02) brightness(1);
  scale: 1.07;
}
.is-active .tile__tint,
.tile:focus-visible .tile__tint {
  opacity: 0.18;
}
.is-active .tile__title,
.tile:focus-visible .tile__title {
  transform: translateY(-6px);
}
.is-active .tile__go,
.tile:focus-visible .tile__go {
  background: var(--color-bone);
  border-color: var(--color-bone);
  color: var(--color-ink);
}
.is-active .tile__go-icon {
  transform: rotate(45deg);
}

@media (hover: hover) and (pointer: fine) {
  .tile:hover .tile__img {
    filter: grayscale(0) contrast(1.02) brightness(1);
    scale: 1.07;
  }
  .tile:hover .tile__tint {
    opacity: 0.18;
  }
  .tile:hover .tile__title {
    transform: translateY(-6px);
  }
  .tile:hover .tile__go {
    background: var(--color-bone);
    border-color: var(--color-bone);
    color: var(--color-ink);
  }
  .tile:hover .tile__go-icon {
    transform: rotate(45deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tile__img,
  .is-active .tile__img,
  .tile:hover .tile__img {
    scale: 1;
    translate: 0 0;
    transition: filter 200ms linear;
  }
  .tile__title,
  .is-active .tile__title,
  .tile:hover .tile__title {
    transform: none;
    transition: color 200ms linear;
  }
  .tile__go-icon,
  .is-active .tile__go-icon,
  .tile:hover .tile__go-icon {
    transform: none;
  }
}
</style>
