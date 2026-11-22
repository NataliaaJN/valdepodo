<script setup lang="ts">
/**
 * Plantilla conceptual por capas + campo de fibras (dentro de <TresCanvas>), spec 08 §4.
 *
 * Estado declarativo (spec 08 §1.4), leído en el bucle de render con amortiguación:
 * - `explode` 0..1 → separación vertical de las capas (explodeOffset de cada capa), giro del modelo y
 *   órbita de la cámara (valores de tools/blender/config/insole.json → view.explode).
 * - `build` 0..1 → construcción por fibras (1 = plantilla completa; las fibras no se dibujan).
 * Emite la posición en pantalla de un punto de cada capa para las etiquetas DOM (`anchors`).
 */
import { useLoop, useTres, useTresContext } from '@tresjs/core'
import {
  Group,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  Object3D,
  Vector3,
  type Object3D as Object3DType,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import {
  createFiberField,
  sampleSurface,
  upwardSurface,
  type FiberField,
} from '~/features/services/utils/fiber-field'
import {
  INSOLE_VIEW,
  fiberOpacity,
  layerState,
  type InsoleLayerId,
} from '~/features/services/utils/insole-scene'

export interface ScreenPoint {
  /** Posición en el canvas, 0..1 desde arriba a la izquierda. */
  x: number
  y: number
}

/** Puntos de una capa en pantalla: sus dos extremos (talón y puntera), ordenados de izquierda a derecha. */
export interface LayerAnchor {
  id: InsoleLayerId
  left: ScreenPoint
  right: ScreenPoint
}

const props = defineProps<{
  explode: number
  build: number
  fiberCount: number
  /** false con reduced motion: sin deriva de las fibras. */
  motion: boolean
}>()
const emit = defineEmits<{ loaded: [ms: number]; anchors: [anchors: LayerAnchor[]] }>()

const { invalidate } = useTres()
const { camera, sizes } = useTresContext()
const { onBeforeRender } = useLoop()

const LAYER_STYLE: Record<InsoleLayerId, { color: string; roughness: number }> = {
  top: { color: '#C9EBF6', roughness: 0.6 },
  middle: { color: '#1EABE1', roughness: 0.42 },
  base: { color: '#1270B6', roughness: 0.38 },
}

interface LayerEntry {
  id: InsoleLayerId
  mesh: Mesh
  material: MeshPhysicalMaterial
  explodeOffset: number
  basePosY: number
  baseScaleY: number
  /** Extremos de la capa (talón y puntera) en la cara superior. */
  ends: [Object3DType, Object3DType]
  anchorRestY: number
}

const pivot = new Group()
const layers: LayerEntry[] = []
let fibers: FiberField | undefined
let model: Object3DType | undefined
const target = new Vector3(...INSOLE_VIEW.target)
const cameraRest = new Vector3(...INSOLE_VIEW.position)
const tmp = new Vector3()

const state = { explode: props.explode, build: props.build }
let lastAnchors = ''

function apply() {
  const e = MathUtils.smootherstep(state.explode, 0, 1)
  for (const layer of layers) {
    const s = layerState(layer.id, layer.explodeOffset, e, state.build)
    layer.mesh.position.y = layer.basePosY * s.scaleY + s.offsetY
    layer.mesh.scale.y = layer.baseScaleY * s.scaleY
    layer.mesh.visible = s.opacity > 0.002
    layer.material.opacity = s.opacity
    layer.material.depthWrite = s.opacity > 0.98
    for (const end of layer.ends) end.position.y = layer.anchorRestY + s.offsetY
  }
  pivot.rotation.y = MathUtils.degToRad(INSOLE_VIEW.explode.model_rotation_deg) * e

  const cam = camera.activeCamera.value
  if (cam) {
    const orbit = MathUtils.degToRad(INSOLE_VIEW.explode.camera_orbit_deg) * e
    tmp.subVectors(cameraRest, target).applyAxisAngle(new Vector3(0, 1, 0), orbit)
    cam.position.copy(target).add(tmp)
    cam.lookAt(target)
  }

  if (fibers) {
    fibers.mesh.visible = state.build < 0.999
    fibers.uniforms.uProgress.value = state.build
    fibers.uniforms.uOpacity.value = fiberOpacity(state.build) > 0 ? 1 : 0
  }
}

function emitAnchors() {
  const cam = camera.activeCamera.value
  if (!cam || !layers.length) return
  pivot.updateMatrixWorld(true)
  const anchors = layers.map((layer) => {
    const [a, b] = layer.ends.map((end) => {
      end.getWorldPosition(tmp).project(cam)
      return { x: (tmp.x + 1) / 2, y: (1 - tmp.y) / 2 }
    }) as [ScreenPoint, ScreenPoint]
    return a.x <= b.x ? { id: layer.id, left: a, right: b } : { id: layer.id, left: b, right: a }
  })
  const key = anchors
    .map(
      (a) => `${a.left.x.toFixed(3)},${a.left.y.toFixed(3)},${a.right.x.toFixed(3)},${a.right.y.toFixed(3)}`,
    )
    .join('|')
  if (key === lastAnchors) return
  lastAnchors = key
  emit('anchors', anchors)
}

onMounted(async () => {
  const t0 = performance.now()
  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  const gltf = await loader.loadAsync(publicUrl('/models/insole.glb'))
  model = gltf.scene
  model.updateMatrixWorld(true)

  model.traverse((obj) => {
    if (!(obj instanceof Mesh) || !obj.name.startsWith('layer_')) return
    const id = obj.name.slice('layer_'.length) as InsoleLayerId
    const style = LAYER_STYLE[id]
    const material = new MeshPhysicalMaterial({
      color: style.color,
      roughness: style.roughness,
      clearcoat: 0.25,
      clearcoatRoughness: 0.5,
      transparent: true,
    })
    ;(obj.material as MeshPhysicalMaterial).dispose()
    obj.material = material

    obj.geometry.computeBoundingBox()
    const box = obj.geometry.boundingBox!.clone().applyMatrix4(obj.matrixWorld)
    // Anclas de las etiquetas: extremos de talón y puntera, sobre la línea media y a media altura de la capa
    const midY = (box.min.y + box.max.y) / 2
    const ends = [box.min.z + 0.006, box.max.z - 0.006].map((z) => {
      const end = new Object3D()
      end.position.set((box.min.x + box.max.x) / 2, midY, z)
      pivot.add(end)
      return end
    }) as [Object3DType, Object3DType]

    layers.push({
      id,
      mesh: obj,
      material,
      explodeOffset: Number(obj.userData.explodeOffset ?? 0),
      basePosY: obj.position.y,
      baseScaleY: obj.scale.y,
      ends,
      anchorRestY: midY,
    })
  })

  const top = layers.find((l) => l.id === 'top')
  if (top && props.fiberCount > 0) {
    const surface = upwardSurface(top.mesh)
    fibers = createFiberField(sampleSurface(surface, props.fiberCount))
    surface.dispose()
    pivot.add(fibers.mesh)
  }

  pivot.add(model)
  apply()
  emit('loaded', performance.now() - t0)
  invalidate()
})

let time = 0
onBeforeRender(({ delta }) => {
  const next = {
    explode: MathUtils.damp(state.explode, props.explode, 7, delta),
    build: MathUtils.damp(state.build, props.build, 7, delta),
  }
  const moving = Math.abs(next.explode - state.explode) > 1e-4 || Math.abs(next.build - state.build) > 1e-4
  // Las fibras dispersas "flotan": mientras se ven antes de agruparse, se renderiza en continuo
  const drifting = props.motion && fibers !== undefined && state.build > 0.001 && state.build < 0.45
  if (drifting) {
    time += delta
    fibers!.uniforms.uTime.value = time
  }
  if (moving) Object.assign(state, next)
  if (moving || drifting) {
    apply()
    invalidate()
  }
  emitAnchors()
})

watch(
  () => [sizes.width.value, sizes.height.value],
  () => {
    lastAnchors = ''
    invalidate()
  },
)

onBeforeUnmount(() => {
  fibers?.dispose()
  for (const layer of layers) {
    layer.mesh.geometry.dispose()
    layer.material.dispose()
  }
})
</script>

<template>
  <primitive :object="pivot" />
</template>
