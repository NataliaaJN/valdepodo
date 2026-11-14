<script setup lang="ts">
import { gsap } from 'gsap'

/**
 * Pre-footer global: una pieza compacta, no un hero. Mensaje a la izquierda, un recorrido de huellas alternas
 * (pie izquierdo / derecho) que sube en diagonal y desemboca en «Pedir cita». Fondo claro con tokens de marca;
 * el footer (tinta) viene justo debajo.
 *
 * Animación: un timeline GSAP + ScrollTrigger con `scrub` (useGsapContext, como el resto del sitio) revela las
 * huellas con el scroll y, al final, el botón. Sin JS o con `prefers-reduced-motion` todo se ve ya dibujado.
 * Lo pinta el layout al final de todas las páginas (salvo en `/contacto`, donde ya está el formulario).
 */
withDefaults(
  defineProps<{
    title?: string
    text?: string
    cta?: { label: string; to: string }
  }>(),
  {
    title: 'Cada paso cuenta',
    text: 'Reserva tu cita y empezamos por lo que más te preocupa.',
    cta: () => ({ label: 'Pedir cita', to: '/contacto#cita' }),
  },
)

const STEPS = 9
/** Proporción nominal del lienzo (ancho:alto) para orientar cada huella según la trayectoria. */
const ASPECT = 3

// Trayectoria orgánica: sube en diagonal con una ondulación suave; cada pie se separa del eje a un lado.
const centre = (t: number) => ({ x: 4 + 82 * t, y: 76 - 50 * t + 7 * Math.sin(t * Math.PI * 2.1) })

const prints = Array.from({ length: STEPS }, (_, i) => {
  const t = i / (STEPS - 1)
  const a = centre(Math.max(0, t - 0.01))
  const b = centre(Math.min(1, t + 0.01))
  const heading = Math.atan2(b.y - a.y, (b.x - a.x) * ASPECT)
  const side = i % 2 === 0 ? 'left' : 'right'
  const lateral = side === 'left' ? -1 : 1
  const c = centre(t)
  // Desplazamiento perpendicular al avance (en proporciones de la caja)
  const x = c.x + Math.sin(heading) * 6 * lateral * -1 * (1 / ASPECT)
  const y = c.y + Math.cos(heading) * 9 * lateral
  const rot = (heading * 180) / Math.PI + 90 + lateral * 3
  return { side, x: x.toFixed(2), y: y.toFixed(2), rot: rot.toFixed(1), i } as const
})

const section = ref<HTMLElement | null>(null)

// Un único timeline con scrub: las huellas se apoyan una a una y, al terminar, entra el botón.
// Con `prefers-reduced-motion` no se crea nada y todo queda visible.
useGsapContext(section, (c) => {
  if (c.reduce || !section.value) return undefined
  const prints = gsap.utils.toArray<SVGElement>('.print', section.value)
  const link = section.value.querySelector('.cta__link')
  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: { trigger: section.value, start: 'top 88%', end: 'bottom 68%', scrub: 0.6 },
  })
  tl.fromTo(prints, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 1, stagger: 0.55 })
  if (link) tl.fromTo(link, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.1, ease: 'back.out(1.4)' }, '>-0.2')
  return undefined
})
</script>

<template>
  <section
    ref="section"
    class="cta section-clip relative isolate"
    data-nav-theme="bone"
    aria-labelledby="cta-title"
  >
    <div class="container-wide cta__inner">
      <div class="cta__msg">
        <h2 id="cta-title" v-reveal class="cta__title">{{ title }}<span class="cta__stop" aria-hidden="true">.</span></h2>
        <p v-reveal="1" class="cta__text">{{ text }}</p>
      </div>

      <!-- Recorrido: cada huella es un SVG propio (suela + dedos) con relieve de dos capas -->
      <div class="cta__trail" aria-hidden="true">
        <svg
          v-for="p in prints"
          :key="p.i"
          class="print"
          :class="{ 'print--last': p.i === STEPS - 1 }"
          viewBox="-6 -6 124 268"
          focusable="false"
          :style="{ '--i': p.i, left: `${p.x}%`, top: `${p.y}%`, '--rot': `${p.rot}deg` }"
        >
          <g class="print__shadow" transform="translate(3.5 4.5)"><Footprint :side="p.side" variant="fill" /></g>
          <g class="print__body"><Footprint :side="p.side" variant="fill" /></g>
          <g class="print__light" transform="translate(-2 -2.5)">
            <Footprint :side="p.side" variant="outline" :stroke-width="1.6" />
          </g>
        </svg>
      </div>

      <NuxtLink :to="cta.to" class="cta__link">
        <span class="cta__link-label">{{ cta.label }}</span>
        <span class="cta__link-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M5 19 19 5M8 5h11v11" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" />
          </svg>
        </span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.cta {
  /* Claro y azulado, derivado de los tokens (hielo + blanco) */
  background: color-mix(in srgb, var(--color-ice-blue) 22%, var(--color-white));
  color: var(--color-deep-blue);
  border-top: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
  padding-block: clamp(2.5rem, 4vw, 3.5rem);
}

.cta__inner {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: minmax(0, 1fr);
}

.cta__title {
  font-family: var(--font-display);
  font-weight: 650;
  font-stretch: 75%;
  font-size: clamp(2.5rem, 1.4rem + 4.4vw, 4.75rem);
  line-height: 0.92;
  letter-spacing: -0.025em;
  color: var(--color-deep-blue);
}
.cta__stop {
  color: var(--color-cyan);
}
.cta__text {
  margin-top: 0.9rem;
  max-width: 30ch;
  color: var(--color-text-secondary);
  font-size: var(--text-body);
  line-height: var(--text-body--line-height);
}

/* ---------- Recorrido ---------- */
.cta__trail {
  position: relative;
  height: 5rem;
  pointer-events: none;
}
.print {
  position: absolute;
  width: 1.35rem;
  height: auto;
  overflow: visible;
  translate: -50% -50%;
  rotate: var(--rot);
}
.print__shadow {
  fill: color-mix(in srgb, var(--color-primary) 30%, transparent);
  --fp-fill: color-mix(in srgb, var(--color-primary) 26%, transparent);
}
.print__body {
  --fp-fill: color-mix(in srgb, var(--color-ice-blue) 82%, var(--color-primary));
}
.print__light {
  --fp-stroke: var(--color-white);
  opacity: 0.95;
}
.print--last .print__body {
  --fp-fill: color-mix(in srgb, var(--color-primary) 62%, var(--color-ice-blue));
}

/* ---------- CTA: sello circular, el último «paso» del recorrido ---------- */
.cta__link {
  position: relative;
  isolation: isolate;
  justify-self: end;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 0.6rem;
  width: 8rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-bone);
  text-align: center;
  font-family: var(--font-display);
  font-weight: 600;
  font-stretch: 75%;
  font-size: 1.75rem;
  letter-spacing: -0.02em;
  line-height: 0.95;
  transition: background-color var(--dur-base) var(--ease-out-soft);
}
.cta__link-arrow svg {
  display: block;
  width: 1.4rem;
  height: 1.4rem;
  transition: transform var(--dur-base) var(--ease-out-soft);
}
.cta__link:focus-visible {
  opacity: 1 !important;
  transform: none !important;
}
@media (hover: hover) and (pointer: fine) {
  .cta__link:hover {
    background: var(--color-deep-blue);
  }
  .cta__link:hover .cta__link-arrow svg {
    transform: translate(3px, -3px);
  }
  /* La última huella «pisa» al señalar el CTA */
  .cta:has(.cta__link:hover) .print--last .print__body {
    --fp-fill: var(--color-primary);
  }
}

/* ---------- Escritorio: composición horizontal asimétrica ---------- */
@media (min-width: 1024px) {
  .cta__inner {
    grid-template-columns: minmax(0, 5fr) minmax(0, 5fr) auto;
    align-items: center;
    column-gap: clamp(1.5rem, 3vw, 3rem);
  }
  .cta__trail {
    height: 11rem;
    margin-inline: -1rem;
  }
  .print {
    width: 2.1rem;
  }
  .cta__link {
    width: 9.5rem;
    font-size: 2rem;
  }
}
@media (min-width: 1024px) and (max-width: 1279px) {
  .cta__inner {
    grid-template-columns: minmax(0, 4fr) minmax(0, 5fr) auto;
  }
}
</style>
