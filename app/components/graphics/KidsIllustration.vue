<script setup lang="ts">
/**
 * Ilustraciones lineales propias de la valoración infantil (marcha, arco, dedos, calzado), en el mismo
 * lenguaje que `TreatmentIllustration`: trazo azul de marca, rellenos cyan muy claro, esquemáticas y
 * decorativas (aria-hidden).
 */
import type { KidsIllustrationKind } from '~/data/kids'

defineProps<{ kind: KidsIllustrationKind }>()
</script>

<template>
  <svg
    viewBox="0 0 200 140"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    class="kids-illustration"
  >
    <!-- Marcha: dos huellas alternas y el recorrido -->
    <template v-if="kind === 'gait'">
      <path
        d="M30 118 C 60 100, 80 108, 104 84 C 128 60, 150 66, 176 40"
        stroke="var(--color-ice-blue)"
        stroke-width="1.5"
        stroke-dasharray="2 5"
      />
      <g transform="translate(46 22) scale(0.3) rotate(-6 56 128)" style="--fp-fill: var(--color-cyan-light)">
        <Footprint side="left" variant="both" :stroke-width="4" />
      </g>
      <g transform="translate(110 34) scale(0.3) rotate(6 56 128)" style="--fp-fill: var(--color-cyan-light)">
        <Footprint side="right" variant="both" :stroke-width="4" />
      </g>
    </template>

    <!-- Arco: pie de perfil con el arco marcado -->
    <template v-else-if="kind === 'arch'">
      <path
        d="M28 104 C 46 104, 58 78, 92 74 C 122 71, 142 92, 170 98 C 180 100, 180 112, 170 112 L 34 112 C 26 112, 24 107, 28 104 Z"
        stroke="var(--color-primary)"
        stroke-width="1.5"
        fill="var(--color-light-blue)"
      />
      <path d="M58 112 C 70 92, 108 92, 128 112" stroke="var(--color-cyan)" stroke-width="2" />
      <path
        d="M62 80 C 78 56, 120 56, 140 82"
        stroke="var(--color-ice-blue)"
        stroke-width="1.5"
        stroke-dasharray="2 5"
      />
    </template>

    <!-- Dedos y uñas: cinco dedos vistos desde arriba -->
    <template v-else-if="kind === 'toes'">
      <g transform="translate(-12 0)">
        <ellipse
          cx="70"
          cy="78"
          rx="21"
          ry="26"
          stroke="var(--color-primary)"
          stroke-width="1.5"
          fill="var(--color-light-blue)"
        />
        <path
          d="M58 66 C 58 54, 82 54, 82 66 C 78 70, 62 70, 58 66 Z"
          stroke="var(--color-cyan)"
          stroke-width="1.5"
        />
        <ellipse cx="108" cy="64" rx="12" ry="16" stroke="var(--color-primary)" stroke-width="1.5" />
        <ellipse cx="132" cy="70" rx="10.5" ry="14" stroke="var(--color-primary)" stroke-width="1.5" />
        <ellipse cx="152" cy="79" rx="9.5" ry="12.5" stroke="var(--color-primary)" stroke-width="1.5" />
        <ellipse cx="168" cy="91" rx="8" ry="10.5" stroke="var(--color-primary)" stroke-width="1.5" />
        <path d="M44 112 h124" stroke="var(--color-ice-blue)" stroke-width="1.5" stroke-dasharray="2 5" />
      </g>
    </template>

    <!-- Calzado: zapatilla de perfil con la suela desgastada -->
    <template v-else>
      <path
        d="M32 98 L32 66 C 60 68, 80 58, 92 40 L112 48 C 120 66, 142 72, 168 80 C 180 84, 182 98, 172 102 L 36 102 C 32 102, 32 100, 32 98 Z"
        stroke="var(--color-primary)"
        stroke-width="1.5"
        fill="var(--color-light-blue)"
      />
      <path d="M30 112 L174 112" stroke="var(--color-cyan)" stroke-width="2.5" />
      <path d="M100 52 l8 -5 M110 62 l8 -5 M120 70 l8 -5" stroke="var(--color-cyan)" stroke-width="1.5" />
      <path d="M36 112 h30" stroke="var(--color-ice-blue)" stroke-width="2.5" />
    </template>
  </svg>
</template>

<style scoped>
.kids-illustration {
  display: block;
  width: 100%;
  height: 100%;
}
.kids-illustration :deep(path),
.kids-illustration :deep(ellipse) {
  vector-effect: non-scaling-stroke;
}
</style>
