<script setup lang="ts">
/**
 * Escena del pie anatómico para el laboratorio (Fase 2). Contrato de SceneGate: emite `ready` y `contextlost`.
 * La interacción (capa activa, rotación) se controla desde fuera con props → accesible con botones.
 */
import { TresCanvas, dispose, type TresContext } from '@tresjs/core'
import { AgXToneMapping, PMREMGenerator, SRGBColorSpace, type Object3D, type WebGLRenderer } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { FootLayer } from '~/utils/foot-layers'
import type { SceneStats } from '~/utils/scene-types'

const props = withDefaults(
  defineProps<{ src: string; activeLayer: FootLayer; rotationY?: number; idleSpin?: boolean }>(),
  { rotationY: 0, idleSpin: false },
)
const emit = defineEmits<{
  ready: []
  contextlost: []
  stats: [info: SceneStats]
  layers: [available: FootLayer[]]
}>()

const { tier } = useDeviceTier()
const model = shallowRef<Object3D | null>(null)
const dpr = computed<[number, number]>(() => (tier.value === 'full' ? [1, 2] : [1, 1.5]))
let canvasEl: HTMLCanvasElement | undefined
let emittedReady = false

onMounted(async () => {
  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  try {
    model.value = markRaw((await loader.loadAsync(props.src)).scene)
  } catch (error) {
    console.error('[FootAnatomyLab] Error al cargar el GLB', error)
    emit('contextlost')
  }
})

function handleContextLost(event: Event) {
  event.preventDefault()
  emit('contextlost')
}

function onReady(context: TresContext) {
  const renderer = context.renderer.instance as WebGLRenderer
  canvasEl = renderer.domElement
  canvasEl.addEventListener('webglcontextlost', handleContextLost)
  // Reflejos suaves sin HDR externo (spec 08 §1.3)
  const pmrem = new PMREMGenerator(renderer)
  context.scene.value.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  pmrem.dispose()
}

function onRender(context: TresContext) {
  if (emittedReady || !model.value) return
  emittedReady = true
  emit('ready')
  const info = (context.renderer.instance as WebGLRenderer).info
  emit('stats', {
    triangles: info.render.triangles,
    drawCalls: info.render.calls,
    geometries: info.memory.geometries,
    textures: info.memory.textures,
  })
}

onBeforeUnmount(() => {
  canvasEl?.removeEventListener('webglcontextlost', handleContextLost)
  if (model.value) dispose(model.value)
})
</script>

<template>
  <TresCanvas
    alpha
    :clear-alpha="0"
    :dpr="dpr"
    :antialias="tier === 'full'"
    :tone-mapping="AgXToneMapping"
    :output-color-space="SRGBColorSpace"
    render-mode="on-demand"
    @ready="onReady"
    @render="onRender"
  >
    <TresPerspectiveCamera :position="[2.6, 1.3, 2.8]" :look-at="[0, 0, 0]" :fov="32" />
    <TresHemisphereLight :args="['#EAF5FA', '#163C63', 0.9]" />
    <TresDirectionalLight :position="[3, 5, 4]" :intensity="2" />
    <TresDirectionalLight :position="[-4, 1, -3]" :intensity="1.2" color="#1EABE1" />
    <FootAnatomyModel
      v-if="model"
      :model="model"
      :active-layer="activeLayer"
      :rotation-y="rotationY"
      :idle-spin="idleSpin"
      @layers="(l) => emit('layers', l)"
    />
  </TresCanvas>
</template>
