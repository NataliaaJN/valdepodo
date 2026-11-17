<script setup lang="ts">
/**
 * Pie procedural "premium medical" (dentro de <TresCanvas>).
 * Estado declarativo (spec 08 §1.4): `progress` 0–1 (scroll, luego vía ScrollTrigger) y `pointer`
 * (objeto mutable no reactivo, −1…1) que se leen en el bucle de render con amortiguación.
 */
import { useLoop, useTres } from '@tresjs/core'
import { DirectionalLight, Group, MathUtils, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from 'three'
import { createContactShadowTexture, createFootMaterial } from '~/utils/foot-material'
import { FOOT_TOP, buildFootGeometry } from '~/utils/procedural-foot'

export interface PointerState {
  x: number
  y: number
}

const props = defineProps<{
  quality: 'full' | 'lite'
  progress: number
  pointer: PointerState
  /** false con prefers-reduced-motion: sin inclinación por cursor. */
  motion: boolean
}>()
const emit = defineEmits<{ built: [ms: number] }>()

const { invalidate } = useTres()
const { onBeforeRender } = useLoop()

const { geometry, buildMs } = buildFootGeometry(props.quality)
onMounted(() => emit('built', buildMs))

const { material, uniforms } = createFootMaterial(FOOT_TOP)
const foot = new Mesh(geometry, material)
geometry.computeBoundingBox()
const center = geometry.boundingBox!.getCenter(new Vector3())

const shadowTexture = createContactShadowTexture()
const shadowMaterial = new MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
const shadow = new Mesh(new PlaneGeometry(3.3, 1.5), shadowMaterial)
shadow.rotation.x = -Math.PI / 2
shadow.position.set(1.3, 0.002, -0.05)

// Jerarquía: tilt (cursor) → pose (scroll) → pie centrado + sombra
const inner = new Group()
inner.add(foot, shadow)
inner.position.set(-center.x, -center.y * 0.8, -center.z)
const pose = new Group()
pose.add(inner)
const tilt = new Group()
tilt.add(pose)

// Luz que sigue al cursor: el componente "tecnológico" viene de la iluminación, no de la forma.
const cursorLight = new DirectionalLight('#DFF4FC', 0.9)
tilt.add(cursorLight)

/** Poses de la secuencia: 0 = vista 3/4 lateral; 1 = planta hacia la cámara con apoyos resaltados. */
const POSE = {
  from: { y: 0.55, x: 0.22 },
  to: { y: 0.15, x: -1.05 },
}

const state = { progress: props.progress, px: 0, py: 0 }

function apply() {
  const e = MathUtils.smootherstep(state.progress, 0, 1)
  pose.rotation.y = MathUtils.lerp(POSE.from.y, POSE.to.y, e)
  pose.rotation.x = MathUtils.lerp(POSE.from.x, POSE.to.x, e)
  uniforms.uHighlight.value = MathUtils.smoothstep(state.progress, 0.45, 0.95)
  shadowMaterial.opacity = 1 - MathUtils.smoothstep(state.progress, 0, 0.4)
  tilt.rotation.y = state.px * 0.22
  tilt.rotation.x = -state.py * 0.1
  cursorLight.position.set(state.px * 3, 1.2 + state.py * 1.5, 3)
}
apply()

onBeforeRender(({ delta }) => {
  const tx = props.motion ? props.pointer.x : 0
  const ty = props.motion ? props.pointer.y : 0
  const next = {
    progress: MathUtils.damp(state.progress, props.progress, 6, delta),
    px: MathUtils.damp(state.px, tx, 3, delta),
    py: MathUtils.damp(state.py, ty, 3, delta),
  }
  const moving =
    Math.abs(next.progress - state.progress) > 1e-4 ||
    Math.abs(next.px - state.px) > 1e-4 ||
    Math.abs(next.py - state.py) > 1e-4
  if (!moving) return // on-demand: solo se renderiza mientras algo se mueve
  Object.assign(state, next)
  apply()
  invalidate()
})

onBeforeUnmount(() => {
  geometry.dispose()
  material.dispose()
  shadow.geometry.dispose()
  shadowMaterial.dispose()
  shadowTexture.dispose()
})
</script>

<template>
  <primitive :object="tilt" />
</template>
