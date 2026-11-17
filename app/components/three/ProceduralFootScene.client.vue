<script setup lang="ts">
/**
 * Escena del pie procedural. Contrato de SceneGate: emite `ready` y `contextlost`.
 * Iluminación de estudio (spec 08 §1.3): hemisférica + luz principal + contraluz cian + RoomEnvironment.
 */
import { TresCanvas, type TresContext } from '@tresjs/core'
import { AgXToneMapping, PMREMGenerator, SRGBColorSpace, type WebGLRenderer } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { SceneStats } from '~/utils/scene-types'
import type { PointerState } from './ProceduralFootModel.vue'

withDefaults(defineProps<{ progress?: number; pointer?: PointerState; motion?: boolean }>(), {
  progress: 0,
  pointer: () => ({ x: 0, y: 0 }),
  motion: true,
})
const emit = defineEmits<{ ready: []; contextlost: []; stats: [info: SceneStats & { buildMs: number }] }>()

const { tier } = useDeviceTier()
const dpr = computed<[number, number]>(() => (tier.value === 'full' ? [1, 2] : [1, 1.5]))
let canvasEl: HTMLCanvasElement | undefined
let buildMs = 0
let emittedReady = false
const onBuilt = (ms: number) => (buildMs = ms)

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
  context.scene.value.environmentIntensity = 0.4
  pmrem.dispose()
}

function onRender(context: TresContext) {
  if (emittedReady || !buildMs) return
  emittedReady = true
  emit('ready')
  const info = (context.renderer.instance as WebGLRenderer).info
  emit('stats', {
    triangles: info.render.triangles,
    drawCalls: info.render.calls,
    geometries: info.memory.geometries,
    textures: info.memory.textures,
    buildMs,
  })
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
    <TresPerspectiveCamera :position="[0, 1.7, 6.2]" :look-at="[0, 0.1, 0]" :fov="30" />
    <TresHemisphereLight :args="['#FFFFFF', '#163C63', 0.5]" />
    <TresDirectionalLight :position="[-2.5, 4, 3]" :intensity="3.2" color="#FFFFFF" />
    <TresDirectionalLight :position="[3, 1.5, -3.5]" :intensity="4.5" color="#1EABE1" />
    <ProceduralFootModel
      :quality="tier === 'full' ? 'full' : 'lite'"
      :progress="progress"
      :pointer="pointer"
      :motion="motion"
      @built="onBuilt"
    />
  </TresCanvas>
</template>
