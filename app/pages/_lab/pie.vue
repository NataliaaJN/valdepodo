<script setup lang="ts">
/**
 * Laboratorio · Pie anatómico (Fase 2). Prototipo para la validación anatómica y estética.
 * - Capas generadas desde las presentes en el GLB.
 * - Rotación por arrastre horizontal (no bloquea el scroll vertical en táctil) y por botones.
 */
import { FOOT_LAYER_LABELS, FOOT_LAYER_ORDER, type FootLayer } from '~/utils/foot-layers'
import type { SceneStats } from '~/utils/scene-types'

useSeoMeta({ title: 'Laboratorio · Pie anatómico', robots: 'noindex, nofollow' })

const variant = ref<'full' | 'lite'>('full')
const activeLayer = ref<FootLayer>('skin')
const available = ref<FootLayer[]>([])
const rotationY = ref(-0.6)
const stats = ref<SceneStats | null>(null)
const status = ref('esperando')
const reducedMotion = useReducedMotion()
const idleSpin = ref(false)

const layers = computed(() => FOOT_LAYER_ORDER.filter((l) => available.value.includes(l)))
const loader = () => import('~/components/three/FootAnatomy.client.vue')
const sceneProps = computed(() => ({
  src: `/models/foot-proto.${variant.value}.glb`,
  activeLayer: activeLayer.value,
  rotationY: rotationY.value,
  idleSpin: idleSpin.value && !reducedMotion.value,
  onStats: (s: SceneStats) => (stats.value = s),
  onLayers: (l: FootLayer[]) => (available.value = l),
}))

// Arrastre horizontal → rotación (touch-action: pan-y deja pasar el scroll vertical)
let dragX: number | null = null
function onPointerDown(e: PointerEvent) {
  dragX = e.clientX
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onPointerMove(e: PointerEvent) {
  if (dragX === null) return
  rotationY.value += (e.clientX - dragX) * 0.01
  dragX = e.clientX
}
function onPointerUp() {
  dragX = null
}
function rotate(step: number) {
  rotationY.value += step
}
</script>

<template>
  <div class="container-site py-12">
    <NuxtLink to="/_lab" class="text-sm text-primary-strong underline underline-offset-4"
      >← Laboratorio</NuxtLink
    >
    <h1 class="mt-4 font-display text-display-m text-deep-blue">Pie anatómico · prototipo</h1>
    <p class="mt-3 max-w-[70ch] text-text-secondary">
      Geometría de BodyParts3D 4.0 (pie derecho), extraída con <code>tools/blender/extract_foot.py</code>.
      <strong class="text-text">Pendiente de validación anatómica por la podóloga.</strong>
    </p>

    <div class="mt-8 grid gap-8 lg:grid-cols-12">
      <div class="lg:col-span-8">
        <div
          class="relative cursor-grab overflow-hidden rounded-l border border-border bg-[radial-gradient(70%_70%_at_60%_40%,#eaf5fa,#f5f8fc)] active:cursor-grabbing"
          style="touch-action: pan-y"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <SceneGate
            :key="variant"
            :loader="loader"
            :scene-props="sceneProps"
            aspect-ratio="4 / 3"
            @ready="status = 'lista'"
            @fallback="(r) => (status = `fallback (${r})`)"
          />
        </div>
        <p class="mt-2 text-xs text-text-secondary">
          Modelo basado en BodyParts3D, © The Database Center for Life Science, CC BY 4.0.
        </p>
      </div>

      <div class="grid content-start gap-6 lg:col-span-4">
        <fieldset>
          <legend class="eyebrow text-text-secondary">Capa</legend>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="layer in layers"
              :key="layer"
              type="button"
              :aria-pressed="activeLayer === layer"
              class="min-h-11 rounded-pill border px-4 text-sm font-semibold transition-colors"
              :class="
                activeLayer === layer
                  ? 'border-primary bg-primary text-white'
                  : 'border-border-strong bg-white text-deep-blue hover-fine:border-primary'
              "
              @click="activeLayer = layer"
            >
              {{ FOOT_LAYER_LABELS[layer] }}
            </button>
          </div>
        </fieldset>

        <div>
          <p class="eyebrow text-text-secondary">Rotación</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <BaseButton size="sm" variant="secondary" @click="rotate(-0.5)">Girar ←</BaseButton>
            <BaseButton size="sm" variant="secondary" @click="rotate(0.5)">Girar →</BaseButton>
            <BaseButton size="sm" variant="ghost" @click="idleSpin = !idleSpin">
              {{ idleSpin ? 'Detener giro' : 'Giro automático' }}
            </BaseButton>
          </div>
        </div>

        <fieldset>
          <legend class="eyebrow text-text-secondary">Variante</legend>
          <div class="mt-3 flex gap-2">
            <button
              v-for="v in ['full', 'lite'] as const"
              :key="v"
              type="button"
              :aria-pressed="variant === v"
              class="min-h-11 rounded-pill border px-4 text-sm font-semibold"
              :class="
                variant === v ? 'border-deep-blue bg-deep-blue text-white' : 'border-border-strong bg-white'
              "
              @click="variant = v"
            >
              {{ v }}
            </button>
          </div>
        </fieldset>

        <dl class="grid gap-3 text-sm" data-testid="lab-stats">
          <div>
            <dt class="eyebrow text-text-secondary">Estado</dt>
            <dd data-testid="lab-status">{{ status }}</dd>
          </div>
          <div v-if="stats">
            <dt class="eyebrow text-text-secondary">Render (capa actual)</dt>
            <dd>{{ stats.triangles.toLocaleString('es') }} triángulos · {{ stats.drawCalls }} draw calls</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>
