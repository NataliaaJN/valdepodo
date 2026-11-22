<script setup lang="ts">
/**
 * Escena de la plantilla conceptual y las fibras (spec 08 §4). Contrato de SceneGate: emite `ready` y
 * `contextlost`. Mismo encuadre que los pósters de Blender (INSOLE_VIEW). Render on-demand.
 */
import { TresCanvas, type TresContext } from '@tresjs/core'
import { AgXToneMapping, PMREMGenerator, SRGBColorSpace, type WebGLRenderer } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { FIBER_COUNT, INSOLE_VIEW } from '~/features/services/utils/insole-scene'
import type { SceneStats } from '~/types/scene-types'
import type { LayerAnchor } from './InsoleModel.vue'

const props = withDefaults(
  defineProps<{
    explode?: number
    build?: number
    motion?: boolean
    /** Fuerza el número de fibras (laboratorio). Por defecto, según el nivel del dispositivo. */
    fiberCount?: number
  }>(),
  { explode: 0, build: 1, motion: true, fiberCount: undefined },
)
const emit = defineEmits<{
  ready: []
  contextlost: []
  stats: [info: SceneStats & { buildMs: number }]
  anchors: [anchors: LayerAnchor[]]
}>()

const { tier } = useDeviceTier()
const dpr = computed<[number, number]>(() => (tier.value === 'full' ? [1, 2] : [1, 1.5]))
const fibers = computed(
  () => props.fiberCount ?? (tier.value === 'full' ? FIBER_COUNT.full : FIBER_COUNT.lite),
)

let canvasEl: HTMLCanvasElement | undefined
let loadMs = 0
let emittedReady = false
let lastStats = 0

function onLoaded(ms: number) {
  loadMs = ms
}

function handleContextLost(event: Event) {
  event.preventDefault()
  emit('contextlost')
}

function onReady(context: TresContext) {
  const renderer = context.renderer.instance as WebGLRenderer
  canvasEl = renderer.domElement
  canvasEl.addEventListener('webglcontextlost', handleContextLost)
  const pmrem = new PMREMGenerator(renderer)
  context.scene.value.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  context.scene.value.environmentIntensity = 0.45
  pmrem.dispose()
}

function onRender(context: TresContext) {
  if (!loadMs) return
  const now = performance.now()
  if (emittedReady && now - lastStats < 500) return // métricas para el laboratorio, sin saturar a Vue
  lastStats = now
  const info = (context.renderer.instance as WebGLRenderer).info
  const stats = {
    triangles: info.render.triangles,
    drawCalls: info.render.calls,
    geometries: info.memory.geometries,
    textures: info.memory.textures,
    buildMs: loadMs,
  }
  if (!emittedReady) {
    emittedReady = true
    emit('ready')
  }
  emit('stats', stats)
}

onBeforeUnmount(() => canvasEl?.removeEventListener('webglcontextlost', handleContextLost))
</script>

<template>
  <TresCanvas
    alpha
    :clear-alpha="0"
    premultiplied-alpha
    :dpr="dpr"
    :antialias="tier === 'full'"
    :tone-mapping="AgXToneMapping"
    :output-color-space="SRGBColorSpace"
    render-mode="on-demand"
    @ready="onReady"
    @render="onRender"
  >
    <TresPerspectiveCamera
      :position="INSOLE_VIEW.position"
      :look-at="INSOLE_VIEW.target"
      :fov="INSOLE_VIEW.fov"
      :near="0.01"
      :far="10"
    />
    <TresHemisphereLight :args="['#FFFFFF', '#163C63', 0.55]" />
    <TresDirectionalLight :position="[-2.5, 4, 3]" :intensity="3" color="#FFFFFF" />
    <TresDirectionalLight :position="[3, 1.5, -3.5]" :intensity="3.5" color="#1EABE1" />
    <InsoleModel
      :explode="explode"
      :build="build"
      :fiber-count="fibers"
      :motion="motion"
      @loaded="onLoaded"
      @anchors="(a) => emit('anchors', a)"
    />
  </TresCanvas>
</template>
