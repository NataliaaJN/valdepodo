<script setup lang="ts">
/**
 * Laboratorio · Pie procedural en una maqueta de hero (spec 03 §1): fondo real de la web, reacción al cursor
 * y progreso de scroll sobre una sección pineada. Sin modelos externos. Comparar con /_lab/pie.
 * `progress` y `pointer` son el estado declarativo que más adelante animará ScrollTrigger (spec 08 §1.4).
 */
import type { SceneStats } from '~/utils/scene-types'

useSeoMeta({ title: 'Laboratorio · Pie procedural', robots: 'noindex, nofollow' })

const reducedMotion = useReducedMotion()
const track = ref<HTMLElement | null>(null)
const progress = ref(0)
const pointer = markRaw({ x: 0, y: 0 }) // mutable, no reactivo: lo lee el bucle de render
const stats = ref<(SceneStats & { buildMs: number }) | null>(null)

const loader = () => import('~/components/three/ProceduralFootScene.client.vue')
const sceneProps = computed(() => ({
  progress: progress.value,
  pointer,
  motion: !reducedMotion.value,
  onStats: (s: SceneStats & { buildMs: number }) => (stats.value = s),
}))

function onScroll() {
  if (!track.value) return
  const rect = track.value.getBoundingClientRect()
  const range = rect.height - window.innerHeight
  progress.value = Math.min(1, Math.max(0, -rect.top / range))
}
function onPointerMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1
  pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  onScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('pointermove', onPointerMove)
})
</script>

<template>
  <div>
    <section ref="track" class="relative h-[260vh]">
      <div class="sticky top-0 h-svh min-h-[680px] overflow-hidden bg-surface">
        <div class="absolute inset-0 bg-(image:--grad-atmosphere)" aria-hidden="true" />
        <div class="container-site relative grid h-full content-center gap-6 lg:grid-cols-12 lg:items-center">
          <div class="relative z-10 lg:col-span-5">
            <NuxtLink to="/_lab" class="text-sm text-primary-strong underline underline-offset-4"
              >← Laboratorio · pie procedural</NuxtLink
            >
            <p class="eyebrow mt-6 text-primary-strong">Clínica de podología</p>
            <h1 class="mt-3 font-display text-display-l text-deep-blue">
              Todo empieza por tus <em>pies</em>.
            </h1>
            <p class="mt-4 max-w-[46ch] text-text-secondary">
              Analizamos cómo está construido tu pie y cómo se mueve para cuidarlo en cada paso.
            </p>
            <p class="mt-6 text-xs text-text-secondary">
              Prueba: geometría generada en el navegador, sin modelos externos · progreso
              {{ Math.round(progress * 100) }} %
              <template v-if="stats">
                · {{ stats.triangles.toLocaleString('es') }} triángulos · {{ Math.round(stats.buildMs) }} ms
              </template>
            </p>
          </div>
          <div
            class="aspect-square max-h-[70svh] w-full lg:col-span-7 lg:aspect-auto lg:h-[80svh] lg:max-h-none"
          >
            <SceneGate :loader="loader" :scene-props="sceneProps" aspect-ratio="auto" class="h-full" />
          </div>
        </div>
      </div>
    </section>
    <div class="container-site py-24 text-text-secondary">Fin de la secuencia (aquí entraría Servicios).</div>
  </div>
</template>
