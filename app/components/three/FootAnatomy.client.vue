<script setup lang="ts">
/**
 * Escena del pie anatómico (spec 08 §2). Contrato de SceneGate: emite `ready` y `contextlost`.
 * - Estado declarativo desde fuera (capa activa, rotación): lo animan los controles o ScrollTrigger.
 * - Encuadre y luces compartidos con los pósters de Blender: tools/blender/config/foot-view.json.
 * - Variante del GLB según el nivel del dispositivo (full / lite), salvo que se fije `src`.
 */
import { TresCanvas, dispose, type TresContext } from '@tresjs/core'
import { AgXToneMapping, PMREMGenerator, SRGBColorSpace, type Object3D, type WebGLRenderer } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { FOOT_VIEW } from '~/utils/foot-layers'
import type { FootLayer } from '~/utils/foot-layers'
import type { SceneStats } from '~/utils/scene-types'

const props = withDefaults(
  defineProps<{ src?: string; activeLayer: FootLayer; rotationY?: number; idleSpin?: boolean }>(),
  { src: undefined, rotationY: FOOT_VIEW.rotationY, idleSpin: false },
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
const lights = FOOT_VIEW.lights
let canvasEl: HTMLCanvasElement | undefined
let emittedReady = false

onMounted(async () => {
  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  const src = props.src ?? `/models/foot-proto.${tier.value === 'full' ? 'full' : 'lite'}.glb`
  try {
    model.value = markRaw((await loader.loadAsync(src)).scene)
  } catch (error) {
    console.error('[FootAnatomy] Error al cargar el GLB', error)
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
    premultiplied-alpha
    render-mode="on-demand"
    @ready="onReady"
    @render="onRender"
  >
    <TresPerspectiveCamera :position="FOOT_VIEW.position" :look-at="FOOT_VIEW.target" :fov="FOOT_VIEW.fov" />
    <TresHemisphereLight
      :args="[lights.hemisphere.sky, lights.hemisphere.ground, lights.hemisphere.intensity]"
    />
    <TresDirectionalLight
      :position="lights.key.position"
      :intensity="lights.key.intensity"
      :color="lights.key.color"
    />
    <TresDirectionalLight
      :position="lights.rim.position"
      :intensity="lights.rim.intensity"
      :color="lights.rim.color"
    />
    <FootAnatomyModel
      v-if="model"
      :model="model"
      :active-layer="activeLayer"
      :rotation-y="rotationY"
      :idle-spin="idleSpin"
      :fit="FOOT_VIEW.fit"
      @layers="(l) => emit('layers', l)"
    />
  </TresCanvas>
</template>
