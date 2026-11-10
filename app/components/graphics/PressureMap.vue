<script setup lang="ts">
/**
 * Mapa de presión ilustrativo sobre una huella (spec 04 §1.4, spec 08 §3). Se renderiza como `<g>` en
 * coordenadas de huella para componerlo dentro de otro `<svg>`.
 *
 * Técnica: cada foco es un círculo blanco con degradado radial (opacidad = intensidad). El grupo pasa por un
 * filtro que difumina, lleva la opacidad acumulada a los canales de color y la colorea con la rampa de marca
 * (feComponentTransfer). La silueta de la huella hace de clipPath.
 *
 * Los atributos de los círculos solo se fijan en el primer render; después los anima GSAP, de modo que Vue
 * no pisa la interpolación. Transiciones: `morph` (interpola focos), `fade` (fundido, para tablet) e
 * `instant` (reduced motion o sin animación).
 */
import { gsap } from 'gsap'
import {
  FOOT_W,
  PRESSURE_RAMP,
  CONTACT_INTENSITY,
  SOLE_PATH,
  TOES,
  focusList,
  type FootSide,
  type MapTransition,
  type PressureState,
} from '~/utils/pressure'

const props = withDefaults(
  defineProps<{
    state: PressureState
    side?: FootSide
    /** `false` apaga el mapa (intensidad 0): sirve para "encenderlo" al entrar en viewport. */
    lit?: boolean
    transition?: MapTransition
    /** Duración del morph en segundos. */
    duration?: number
    /** Focos que se desplazan suavemente en bucle (hero). Desactivado con reduced motion. */
    breathing?: boolean
    /** Dibuja la huella (relleno + contorno). Sin ella queda solo el mapa recortado. */
    footprint?: boolean
    /** Difuminado del mapa, en unidades de huella. */
    blur?: number
  }>(),
  {
    side: 'right',
    lit: true,
    transition: 'morph',
    duration: 0.7,
    breathing: false,
    footprint: true,
    blur: 3,
  },
)

const uid = useId()
const reducedMotion = useReducedMotion()

const target = computed(() =>
  focusList(props.state).map((f) => ({ ...f, intensity: props.lit ? f.intensity : 0 })),
)
const contactTarget = computed(() => (props.lit ? CONTACT_INTENSITY : 0))
// Instantánea para el primer render (SSR incluido). No es reactiva a propósito: después manda GSAP.
const initial = target.value
const initialContact = contactTarget.value

// Refs por índice (un `ref` en v-for no garantiza el orden).
const circles: SVGCircleElement[] = []
const heat = ref<SVGGElement | null>(null)
const contact = ref<SVGGElement | null>(null)

const mirror = computed(() => (props.side === 'left' ? `translate(${FOOT_W} 0) scale(-1 1)` : undefined))
const table = (values: readonly number[]) => values.join(' ')

/** Desfases distintos por foco para que la "respiración" no parezca un latido sincronizado. */
const breathStyle = (i: number) => ({
  '--pm-dur': `${5.2 + ((i * 1.37) % 2.6)}s`,
  '--pm-delay': `${-((i * 0.91) % 4)}s`,
  '--pm-dx': `${((i % 3) - 1) * 2.4}px`,
  '--pm-dy': `${(((i + 1) % 3) - 1) * 3.2}px`,
})

let fadeTl: gsap.core.Timeline | undefined

function apply(mode: MapTransition) {
  const els = circles
  const next = target.value
  const attrsFor = (i: number) => {
    const f = next[i]!
    return { cx: f.x, cy: f.y, r: f.r, 'fill-opacity': f.intensity }
  }

  const contactAttr = { attr: { opacity: contactTarget.value }, overwrite: true }

  if (mode === 'instant' || reducedMotion.value) {
    els.forEach((el, i) => gsap.set(el, { attr: attrsFor(i), overwrite: true }))
    if (contact.value) gsap.set(contact.value, contactAttr)
    return
  }

  if (mode === 'fade' && heat.value) {
    fadeTl?.kill()
    fadeTl = gsap
      .timeline()
      .to(heat.value, { opacity: 0, duration: 0.16, ease: 'power1.in' })
      .add(() => {
        els.forEach((el, i) => gsap.set(el, { attr: attrsFor(i), overwrite: true }))
        if (contact.value) gsap.set(contact.value, contactAttr)
      })
      .to(heat.value, { opacity: 1, duration: 0.24, ease: 'power1.out' })
    return
  }

  els.forEach((el, i) =>
    gsap.to(el, { attr: attrsFor(i), duration: props.duration, ease: 'power2.inOut', overwrite: true }),
  )
  if (contact.value) gsap.to(contact.value, { ...contactAttr, duration: props.duration })
}

watch([target, contactTarget], () => apply(props.transition), { flush: 'post' })

onBeforeUnmount(() => {
  fadeTl?.kill()
  gsap.killTweensOf([...circles, contact.value].filter(Boolean))
})
</script>

<template>
  <g :transform="mirror" class="pressure-map" :class="{ 'is-breathing': breathing }">
    <defs>
      <radialGradient :id="`${uid}-focus`">
        <stop offset="0" stop-color="#fff" stop-opacity="1" />
        <stop offset="0.4" stop-color="#fff" stop-opacity="0.72" />
        <stop offset="0.75" stop-color="#fff" stop-opacity="0.22" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </radialGradient>
      <filter
        :id="`${uid}-heat`"
        x="-15%"
        y="-15%"
        width="130%"
        height="130%"
        color-interpolation-filters="sRGB"
      >
        <feGaussianBlur :stdDeviation="blur" />
        <feColorMatrix type="matrix" values="0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="table" :tableValues="table(PRESSURE_RAMP.r)" />
          <feFuncG type="table" :tableValues="table(PRESSURE_RAMP.g)" />
          <feFuncB type="table" :tableValues="table(PRESSURE_RAMP.b)" />
          <feFuncA type="table" :tableValues="table(PRESSURE_RAMP.a)" />
        </feComponentTransfer>
      </filter>
      <clipPath :id="`${uid}-clip`">
        <path :d="SOLE_PATH" />
        <ellipse
          v-for="(toe, i) in TOES"
          :key="i"
          :cx="toe.cx"
          :cy="toe.cy"
          :rx="toe.rx"
          :ry="toe.ry"
          :transform="`rotate(${toe.rot} ${toe.cx} ${toe.cy})`"
        />
      </clipPath>
    </defs>

    <Footprint v-if="footprint" variant="fill" />

    <g :clip-path="`url(#${uid}-clip)`">
      <g ref="heat" :filter="`url(#${uid}-heat)`">
        <!-- Área de contacto: base tenue bajo los focos -->
        <g ref="contact" :opacity="initialContact" style="--fp-fill: #fff">
          <Footprint variant="fill" />
        </g>
        <g v-for="(f, i) in initial" :key="i" class="pm-focus" :style="breathStyle(i)">
          <circle
            :ref="(el) => (circles[i] = el as SVGCircleElement)"
            :cx="f.x"
            :cy="f.y"
            :r="f.r"
            :fill-opacity="f.intensity"
            :fill="`url(#${uid}-focus)`"
          />
        </g>
      </g>
    </g>

    <Footprint v-if="footprint" variant="outline" />
  </g>
</template>

<style scoped>
.pm-focus {
  transform-box: fill-box;
  transform-origin: center;
}

@media (prefers-reduced-motion: no-preference) {
  .is-breathing .pm-focus {
    animation: pm-breathe var(--pm-dur) var(--ease-in-out-soft) var(--pm-delay) infinite alternate;
  }
}

@keyframes pm-breathe {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(var(--pm-dx), var(--pm-dy)) scale(1.07);
  }
}
</style>
