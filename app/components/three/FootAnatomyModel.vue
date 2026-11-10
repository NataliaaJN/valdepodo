<script setup lang="ts">
/**
 * Contenido 3D del pie anatómico (dentro de <TresCanvas>): materiales de marca por capa y papel de cada capa
 * según la capa activa (spec 08 §2.2).
 * El cambio de capa es un fundido de 500 ms (spec 03 §1): 250 ms de salida, cambio de papeles y 250 ms de
 * entrada. Con reduced motion, el cambio es inmediato.
 */
import { useLoop, useTres } from '@tresjs/core'
import {
  AdditiveBlending,
  Box3,
  Color,
  FrontSide,
  Group,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  ShaderMaterial,
  Vector3,
  type Material,
  type Mesh,
  type Object3D,
} from 'three'
import { layerRoles, type FootLayer, type LayerRole } from '~/utils/foot-layers'

const props = withDefaults(
  defineProps<{
    model: Object3D
    activeLayer: FootLayer
    rotationY: number
    idleSpin: boolean
    fit?: number
  }>(),
  { fit: 2.2 },
)
const emit = defineEmits<{ layers: [available: FootLayer[]] }>()

const { invalidate } = useTres()
const { onBeforeRender } = useLoop()
const group = shallowRef(new Group())

// ---------------------------------------------------------------- materiales
const shellMaterial = new ShaderMaterial({
  uniforms: { uColor: { value: new Color('#1EABE1') }, uStrength: { value: 1 } },
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vView = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uStrength;
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.6);
      gl_FragColor = vec4(uColor, clamp(f * 0.85 * uStrength, 0.0, 1.0));
    }`,
  transparent: true,
  depthWrite: false,
  side: FrontSide,
  blending: AdditiveBlending,
})

const activeMaterials: Record<FootLayer, Material> = {
  skin: new MeshPhysicalMaterial({
    color: '#CFEAF5',
    roughness: 0.55,
    clearcoat: 0.35,
    clearcoatRoughness: 0.4,
  }),
  bones: new MeshStandardMaterial({ color: '#F2F6FB', roughness: 0.62 }),
  muscles: new MeshPhysicalMaterial({
    color: '#1270B6',
    roughness: 0.38,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
  }),
  tendons: new MeshStandardMaterial({
    color: '#1EABE1',
    roughness: 0.3,
    emissive: '#1EABE1',
    emissiveIntensity: 0.25,
  }),
  ligaments: new MeshStandardMaterial({
    color: '#B9E5F3',
    roughness: 0.35,
    emissive: '#1EABE1',
    emissiveIntensity: 0.15,
  }),
}

function contextMaterial(layer: FootLayer): Material {
  const base = activeMaterials[layer].clone()
  base.transparent = true
  base.opacity = layer === 'bones' ? 0.55 : 0.18
  base.depthWrite = layer === 'bones'
  return base
}
const contextMaterials = Object.fromEntries(
  (Object.keys(activeMaterials) as FootLayer[]).map((l) => [l, contextMaterial(l)]),
) as Record<FootLayer, Material>

// ---------------------------------------------------------------- preparación del modelo
const meshesByLayer = new Map<FootLayer, Mesh[]>()
props.model.traverse((child) => {
  const mesh = child as Mesh
  if (!mesh.isMesh) return
  const layer = mesh.userData.layer as FootLayer | undefined
  if (!layer) return
  if (!meshesByLayer.has(layer)) meshesByLayer.set(layer, [])
  meshesByLayer.get(layer)!.push(mesh)
})

const box = new Box3().setFromObject(props.model)
const size = box.getSize(new Vector3())
const center = box.getCenter(new Vector3())
props.model.position.sub(center)
group.value.add(props.model)
group.value.scale.setScalar(props.fit / Math.max(size.x, size.y, size.z))

onMounted(() => emit('layers', [...meshesByLayer.keys()]))

function applyRoles(layerId: FootLayer) {
  const roles = layerRoles(layerId)
  for (const [layer, meshes] of meshesByLayer) {
    const role: LayerRole = roles[layer]
    for (const mesh of meshes) {
      mesh.visible = role !== 'hidden'
      mesh.renderOrder = role === 'shell' ? 10 : role === 'context' ? 5 : 0
      mesh.material =
        role === 'shell'
          ? shellMaterial
          : role === 'context'
            ? contextMaterials[layer]
            : activeMaterials[layer]
    }
  }
  invalidate()
}
// ---------------------------------------------------------------- transición entre capas
const FADE = 0.25 // s por tramo (salida + entrada = 500 ms)
const standardMaterials = [...Object.values(activeMaterials), ...Object.values(contextMaterials)] as (
  MeshStandardMaterial | MeshPhysicalMaterial
)[]
const baseState = new Map(
  standardMaterials.map((m) => [
    m,
    { opacity: m.opacity, transparent: m.transparent, depthWrite: m.depthWrite },
  ]),
)
let shownLayer = props.activeLayer
let fadeT = 1 // 1 = visible
let fadeDir: -1 | 0 | 1 = 0
const reduceMotion = import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function setFade(k: number) {
  for (const m of standardMaterials) {
    const base = baseState.get(m)!
    const fading = k < 1
    const transparent = fading || base.transparent
    if (m.transparent !== transparent) {
      m.transparent = transparent
      m.needsUpdate = true // cambia el programa (orden de dibujo y mezcla)
    }
    m.depthWrite = fading ? false : base.depthWrite
    m.opacity = base.opacity * k
  }
  shellMaterial.uniforms.uStrength!.value = k
}

applyRoles(shownLayer)
watch(
  () => props.activeLayer,
  (layer) => {
    if (reduceMotion) {
      shownLayer = layer
      applyRoles(layer)
      return
    }
    fadeDir = -1
    invalidate()
  },
)

// ---------------------------------------------------------------- rotación
let currentY = props.rotationY
onBeforeRender(({ delta }) => {
  if (fadeDir !== 0) {
    fadeT = Math.min(1, Math.max(0, fadeT + (fadeDir * delta) / FADE))
    if (fadeDir === -1 && fadeT === 0) {
      shownLayer = props.activeLayer
      applyRoles(shownLayer)
      fadeDir = 1
    } else if (fadeDir === 1 && fadeT === 1) {
      fadeDir = props.activeLayer === shownLayer ? 0 : -1
    }
    setFade(fadeT)
    invalidate()
  }
  const target = props.rotationY
  const next = currentY + (target - currentY) * Math.min(1, delta * 8)
  if (Math.abs(next - currentY) > 1e-4 || props.idleSpin) {
    currentY = props.idleSpin ? currentY + delta * 0.15 : next
    group.value.rotation.y = currentY
    invalidate()
  }
})

onBeforeUnmount(() => {
  shellMaterial.dispose()
  for (const m of [...Object.values(activeMaterials), ...Object.values(contextMaterials)]) m.dispose()
})
</script>

<template>
  <primitive :object="group" />
</template>
