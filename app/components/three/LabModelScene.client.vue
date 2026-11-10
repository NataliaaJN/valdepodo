<script setup lang="ts">
/**
 * Escena de laboratorio (Fase 1): comprueba la cadena completa
 * Blender → GLB → gltf-transform (meshopt) → TresJS, con limpieza de recursos.
 * Cumple el contrato de SceneGate: emite `ready` y `contextlost`.
 */
import { TresCanvas, dispose, type TresContext } from '@tresjs/core'
import { ACESFilmicToneMapping, SRGBColorSpace, type Object3D } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import type { SceneStats } from '~/utils/scene-types'

const props = withDefaults(defineProps<{ src: string; spin?: boolean }>(), { spin: true })
const emit = defineEmits<{ ready: []; contextlost: []; stats: [info: SceneStats] }>()

const { tier } = useDeviceTier()
const reducedMotion = useReducedMotion()
const model = shallowRef<Object3D | null>(null)
let canvasEl: HTMLCanvasElement | undefined
let emittedReady = false

const dpr = computed<[number, number]>(() => (tier.value === 'full' ? [1, 2] : [1, 1.5]))

onMounted(async () => {
  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  try {
    const gltf = await loader.loadAsync(props.src)
    model.value = markRaw(gltf.scene)
  } catch (error) {
    console.error('[LabModelScene] Error al cargar el GLB', error)
    emit('contextlost')
  }
})

function handleContextLost(event: Event) {
  event.preventDefault()
  emit('contextlost')
}

function onReady(context: TresContext) {
  const renderer = context.renderer.instance
  if ('domElement' in renderer) {
    canvasEl = renderer.domElement
    canvasEl.addEventListener('webglcontextlost', handleContextLost)
  }
}

function onRender(context: TresContext) {
  if (emittedReady || !model.value) return
  emittedReady = true
  emit('ready')
  const renderer = context.renderer.instance
  if ('info' in renderer && 'render' in renderer.info) {
    const info = renderer.info as unknown as {
      render: { triangles: number; calls: number }
      memory: { geometries: number; textures: number }
    }
    emit('stats', {
      triangles: info.render.triangles,
      drawCalls: info.render.calls,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
    })
  }
}

onBeforeUnmount(() => {
  canvasEl?.removeEventListener('webglcontextlost', handleContextLost)
  if (model.value) dispose(model.value)
  model.value = null
})
</script>

<template>
  <TresCanvas
    alpha
    :clear-alpha="0"
    :dpr="dpr"
    :antialias="tier === 'full'"
    :tone-mapping="ACESFilmicToneMapping"
    :output-color-space="SRGBColorSpace"
    render-mode="on-demand"
    @ready="onReady"
    @render="onRender"
  >
    <TresPerspectiveCamera :position="[3, 2.2, 4]" :look-at="[0, 0, 0]" :fov="40" />
    <TresHemisphereLight :args="['#EAF5FA', '#163C63', 1.1]" />
    <TresDirectionalLight :position="[4, 6, 3]" :intensity="2.2" />
    <TresDirectionalLight :position="[-4, 2, -3]" :intensity="0.8" color="#1EABE1" />
    <ModelPreview v-if="model" :model="model" :spin="spin && !reducedMotion" />
  </TresCanvas>
</template>
