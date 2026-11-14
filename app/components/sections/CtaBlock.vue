<script setup lang="ts">
/**
 * Pre-footer global: una pieza compacta, no un hero. Mensaje a la izquierda, un recorrido de huellas alternas
 * (pie izquierdo / derecho) que sube en diagonal y desemboca en «Pedir cita». Fondo claro con tokens de marca;
 * el footer (tinta) viene justo debajo.
 *
 * Animación: las huellas se van revelando con el scroll. Un solo listener pasivo (activo únicamente mientras la
 * sección está en pantalla) escribe `--p` (0 → 1) en la sección y el CSS decide qué huellas se ven. Sin GSAP.
 * Sin JS o con `prefers-reduced-motion`, `--p` vale 1 y todo se ve ya dibujado.
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
let io: IntersectionObserver | undefined
let frame = 0

function update() {
  frame = 0
  const el = section.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const vh = window.innerHeight
  // 0 cuando la sección asoma por abajo; 1 cuando su parte inferior está ya cerca del borde de la ventana
  const p = (vh - r.top) / (r.height + vh * 0.35)
  el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(3))
}
const onScroll = () => {
  if (!frame) frame = requestAnimationFrame(update)
}

onMounted(() => {
  const el = section.value
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  el.dataset.walk = 'on'
  update()
  io = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll, { passive: true })
        update()
      } else {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
      }
    },
    { rootMargin: '0px 0px 10% 0px' },
  )
  io.observe(el)
})
onBeforeUnmount(() => {
  io?.disconnect()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  if (frame) cancelAnimationFrame(frame)
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
            <path d="M3 12h17M14 5.5 20.5 12 14 18.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" />
          </svg>
        </span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.cta {
  --p: 1;
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
  transform: translate(-50%, -50%) rotate(var(--rot));
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

/* Con JS: cada huella aparece cuando el progreso del scroll alcanza su turno */
.cta[data-walk='on'] .print {
  --k: clamp(0, calc((var(--p) * 11 - var(--i)) / 1.4), 1);
  opacity: var(--k);
  transform: translate(-50%, calc(-50% + (1 - var(--k)) * 6px)) rotate(var(--rot));
}

/* ---------- CTA: pieza sólida azul que aparece cuando el recorrido termina ---------- */
.cta__link {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 1.1rem;
  padding: 1.1rem 1.4rem 1.1rem 1.75rem;
  border-radius: var(--radius-m);
  background: var(--color-primary);
  color: var(--color-bone);
  font-family: var(--font-display);
  font-weight: 600;
  font-stretch: 75%;
  font-size: clamp(1.75rem, 1.2rem + 1.6vw, 2.5rem);
  letter-spacing: -0.02em;
  line-height: 1;
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    opacity var(--dur-base) var(--ease-out-soft);
}
.cta__link-arrow {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--color-cyan);
  color: var(--color-deep-blue);
}
.cta__link-arrow svg {
  width: 1.1rem;
  height: 1.1rem;
  transition: transform var(--dur-base) var(--ease-out-soft);
}

/* Con JS: el CTA entra cuando la última huella ya está apoyada */
.cta[data-walk='on'] .cta__link {
  --k2: clamp(0, calc((var(--p) * 11 - 8.6) / 1), 1);
  opacity: var(--k2);
  transform: translateY(calc((1 - var(--k2)) * 8px));
}
.cta[data-walk='on'] .cta__link:focus-visible {
  opacity: 1;
  transform: none;
}
@media (hover: hover) and (pointer: fine) {
  .cta__link:hover {
    background: var(--color-deep-blue);
  }
  .cta__link:hover .cta__link-arrow svg {
    transform: translateX(3px);
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
    justify-self: end;
  }
}
@media (min-width: 1024px) and (max-width: 1279px) {
  .cta__inner {
    grid-template-columns: minmax(0, 4fr) minmax(0, 5fr) auto;
  }
}
</style>
