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
  Mesh as ThreeMesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  Vector3,
  type Material,
  type Mesh,
  type Object3D,
} from 'three'
import { layerRoles, type FootLayer, type LayerRole } from '~/utils/foot-layers'
import { buildStepTable, sampleStep, soleProfile } from '~/utils/foot-step'

const props = withDefaults(
  defineProps<{
    model: Object3D
    activeLayer: FootLayer
    rotationY: number
    idleSpin: boolean
    fit?: number
    /** Acabado de estudio (hero): piel natural mate. */
    studio?: boolean
    /** Progreso 0..1 del paso (hero). Si se define, el pie simula un paso apoyado en un suelo tenue. */
    step?: number
  }>(),
  { fit: 2.2, studio: false, step: undefined },
)
const emit = defineEmits<{ layers: [available: FootLayer[]] }>()

const { invalidate } = useTres()
const { onBeforeRender } = useLoop()
const group = shallowRef(new Group())
// `motion` agrupa el modelo para cabecearlo/trasladarlo (paso) sin tocar el centrado ni la escala
const motion = new Group()
// `anchor` agrupa pie + suelo y los recoloca juntos para que el recorrido del paso no saque al pie del encuadre
// (como una cámara que sigue al pie: la relación pie–suelo, y por tanto el contacto, no cambia)
const anchor = new Group()

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
  skin: props.studio
    ? new MeshPhysicalMaterial({
        // Piel natural mate: sin transparencia, brillo casi nulo y un velo de «sheen» cálido en los bordes
        color: '#D9A68A',
        roughness: 0.6,
        metalness: 0,
        clearcoat: 0.08,
        clearcoatRoughness: 0.65,
        sheen: 0.9,
        sheenRoughness: 0.45,
        sheenColor: new Color('#F5CDB6'),
        envMapIntensity: 0.85,
      })
    : new MeshPhysicalMaterial({
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
motion.add(props.model)
anchor.add(motion)
group.value.add(anchor)
group.value.scale.setScalar(props.fit / Math.max(size.x, size.y, size.z))

// ---------------------------------------------------------------- paso (hero)
// Perfil de la suela tomado del propio modelo (marco de `motion`, sin escala) → tabla de la simulación
const stepTable = (() => {
  if (props.step === undefined) return undefined
  group.value.updateMatrixWorld(true)
  const inverse = group.value.matrixWorld.clone().invert()
  const skin = meshesByLayer.get('skin') ?? [...meshesByLayer.values()].flat()
  const v = new Vector3()
  const verts: number[] = []
  for (const mesh of skin) {
    const pos = mesh.geometry.getAttribute('position')
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld).applyMatrix4(inverse)
      verts.push(v.x, v.y, v.z)
    }
  }
  return buildStepTable(soleProfile(verts))
})()

// Suelo abstracto muy tenue: velo azul bajo el pie, halo de carga en el punto de apoyo y una onda mínima
// al primer contacto del talón. Solo gama de marca (#00A9D0 / #087EAD).
const floorUniforms = {
  uCenter: { value: new Vector2() },
  uHalf: { value: 0.3 },
  uBase: { value: 0 },
  uContact: { value: new Vector2() },
  uPress: { value: 0 },
  uHit: { value: new Vector2() },
  uRipple: { value: 0 },
}
const floorMaterial = new ShaderMaterial({
  uniforms: floorUniforms,
  vertexShader: /* glsl */ `
    varying vec2 vXZ;
    void main() {
      vXZ = position.xz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform vec2 uCenter;
    uniform float uHalf;
    uniform float uBase;
    uniform vec2 uContact;
    uniform float uPress;
    uniform vec2 uHit;
    uniform float uRipple;
    varying vec2 vXZ;
    void main() {
      float d = length(vXZ - uCenter) / uHalf;
      float edge = 1.0 - smoothstep(0.3, 1.0, d);
      float base = (1.0 - smoothstep(0.1, 1.0, d)) * uBase;
      float sigma = uHalf * 0.34;
      float dc = length(vXZ - uContact);
      float halo = exp(-(dc * dc) / (sigma * sigma)) * uPress * 0.34;
      float rr = uRipple * uHalf * 0.8;
      float w = uHalf * 0.07;
      float dh = length(vXZ - uHit);
      float ring = exp(-pow((dh - rr) / w, 2.0)) * (1.0 - uRipple) * (1.0 - uRipple) * step(0.001, uRipple) * 0.13;
      vec3 col = mix(vec3(0.0, 0.663, 0.816), vec3(0.031, 0.494, 0.678), clamp(halo * 5.0, 0.0, 1.0));
      gl_FragColor = vec4(col, (base + halo + ring) * edge);
    }`,
  transparent: true,
  depthWrite: false,
})
// El plano se construye ya a su tamaño: el shader recibe posiciones en unidades del modelo (sin escala de malla)
// Debe desvanecerse por completo dentro del lienzo: si llega a su borde, el corte se ve como un rectángulo
const floorSize = (stepTable?.length ?? 0.2) * 1.25
const floorMesh = new ThreeMesh(new PlaneGeometry(floorSize, floorSize).rotateX(-Math.PI / 2), floorMaterial)
floorMesh.renderOrder = -1
floorMesh.frustumCulled = false
if (stepTable) {
  floorMesh.position.set(0, stepTable.floorY - 0.0004, 0)
  floorUniforms.uHalf.value = floorSize / 2
  anchor.add(floorMesh)
}

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

// ---------------------------------------------------------------- rotación y paso
let currentY = props.rotationY
let currentStep = props.step ?? 0
let stepYaw = 0
const FOLLOW_Y = 0.6
const FOLLOW_Z = 0.8
const pointer = { x: 0, targetX: 0 }

function applyStep(p: number) {
  if (!stepTable) return
  const pose = sampleStep(stepTable, p)
  motion.rotation.x = pose.theta
  motion.position.set(0, pose.y, pose.z)
  anchor.position.set(0, -FOLLOW_Y * pose.y, -FOLLOW_Z * pose.z)
  stepYaw = pose.yaw
  floorUniforms.uBase.value = 0.04 + 0.09 * pose.near
  floorUniforms.uContact.value.set(pose.contactX, pose.contactZ)
  floorUniforms.uPress.value = pose.press
  floorUniforms.uHit.value.set(pose.hitX, pose.hitZ)
  floorUniforms.uRipple.value = pose.ripple
}
applyStep(currentStep)

// Parallax mínimo del cursor: orienta el pie unas décimas de grado; el movimiento principal es el scroll
function onPointerMove(e: PointerEvent) {
  pointer.targetX = (e.clientX / window.innerWidth - 0.5) * 2
  invalidate()
}
onMounted(() => {
  const fine = window.matchMedia('(pointer: fine)').matches
  if (stepTable && fine && !reduceMotion)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
})
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
  // Progreso del paso amortiguado: manda el scroll, el filtro solo quita el temblor
  if (stepTable && props.step !== undefined) {
    const diff = props.step - currentStep
    if (Math.abs(diff) > 1e-4) {
      currentStep += diff * (1 - Math.exp(-delta * 10))
      applyStep(currentStep)
      invalidate()
    }
  }
  if (Math.abs(pointer.targetX - pointer.x) > 1e-4)
    pointer.x += (pointer.targetX - pointer.x) * Math.min(1, delta * 4)
  const target = props.rotationY
  const next = currentY + (target - currentY) * Math.min(1, delta * 8)
  if (Math.abs(next - currentY) > 1e-4 || props.idleSpin)
    currentY = props.idleSpin ? currentY + delta * 0.15 : next
  const yaw = currentY + stepYaw + pointer.x * 0.06
  if (Math.abs(group.value.rotation.y - yaw) > 1e-5) {
    group.value.rotation.y = yaw
    invalidate()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  shellMaterial.dispose()
  floorMaterial.dispose()
  floorMesh.geometry.dispose()
  for (const m of [...Object.values(activeMaterials), ...Object.values(contextMaterials)]) m.dispose()
})
</script>

<template>
  <primitive :object="group" />
</template>
