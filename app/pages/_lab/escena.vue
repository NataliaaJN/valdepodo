<script setup lang="ts">
import type { SceneStats } from '~/utils/scene-types'

useSeoMeta({ title: 'Laboratorio · Escena de prueba', robots: 'noindex, nofollow' })

const { tier, resolved } = useDeviceTier()
const status = ref<'esperando' | 'lista' | 'fallback'>('esperando')
const fallbackReason = ref('')
const stats = ref<SceneStats | null>(null)

const loader = () => import('~/components/three/LabModelScene.client.vue')
const sceneProps = { src: '/models/test-cube.glb', onStats: (s: SceneStats) => (stats.value = s) }
</script>

<template>
  <div class="container-site py-16">
    <NuxtLink to="/_lab" class="text-sm text-primary-strong underline underline-offset-4"
      >← Laboratorio</NuxtLink
    >
    <h1 class="mt-4 font-display text-display-m text-deep-blue">Escena de prueba</h1>
    <p class="mt-3 max-w-[60ch] text-text-secondary">
      Modelo generado con Blender (<code>tools/blender/test_cube.py</code>), optimizado con gltf-transform
      (meshopt) y cargado con TresJS dentro de <code>SceneGate</code>.
    </p>

    <div class="mt-10 grid gap-8 lg:grid-cols-12">
      <div class="lg:col-span-7">
        <div class="overflow-hidden rounded-l border border-border bg-white">
          <SceneGate
            :loader="loader"
            :scene-props="sceneProps"
            aspect-ratio="4 / 3"
            @ready="status = 'lista'"
            @fallback="(r) => ((status = 'fallback'), (fallbackReason = r))"
          />
        </div>
      </div>
      <dl class="grid content-start gap-4 lg:col-span-5" data-testid="lab-stats">
        <div>
          <dt class="eyebrow text-text-secondary">Nivel del dispositivo</dt>
          <dd class="text-heading-s text-deep-blue">{{ resolved ? tier : '…' }}</dd>
        </div>
        <div>
          <dt class="eyebrow text-text-secondary">Estado</dt>
          <dd class="text-heading-s text-deep-blue" data-testid="lab-status">
            {{ status }}<span v-if="fallbackReason"> ({{ fallbackReason }})</span>
          </dd>
        </div>
        <div v-if="stats">
          <dt class="eyebrow text-text-secondary">Render</dt>
          <dd class="text-text">
            {{ stats.triangles }} triángulos · {{ stats.drawCalls }} draw calls ·
            {{ stats.geometries }} geometrías · {{ stats.textures }} texturas
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
