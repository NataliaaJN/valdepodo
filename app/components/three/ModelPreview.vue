<script setup lang="ts">
/**
 * Contenido de la escena de laboratorio: carga un GLB (meshopt) y lo hace girar lentamente.
 * Vive dentro de <TresCanvas>, por eso puede usar useLoop/useTres.
 */
import { useLoop, useTres } from '@tresjs/core'
import { Box3, Group, Vector3, type Object3D } from 'three'

const props = defineProps<{ model: Object3D; spin: boolean }>()

const group = shallowRef(new Group())
const { invalidate } = useTres()
const { onBeforeRender } = useLoop()

// Centrar y normalizar el modelo a ~2 unidades
const box = new Box3().setFromObject(props.model)
const size = box.getSize(new Vector3())
const center = box.getCenter(new Vector3())
const scale = 2 / Math.max(size.x, size.y, size.z, 1e-6)
props.model.position.sub(center)
group.value.add(props.model)
group.value.scale.setScalar(scale)

onBeforeRender(({ delta }) => {
  if (!props.spin) return
  group.value.rotation.y += delta * 0.4
  invalidate()
})
</script>

<template>
  <primitive :object="group" />
</template>
