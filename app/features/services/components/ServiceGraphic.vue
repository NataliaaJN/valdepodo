<script setup lang="ts">
/**
 * Recurso gráfico de cada servicio (spec 04 §0, spec 03 §2). Decorativo (aria-hidden).
 * `active` (hover con puntero fino, o entrada en viewport en táctil) anima el recurso:
 * focos del mapa que cambian, capas de la plantilla que se separan, huellas que crecen…
 */
import { pressureStates } from '~/features/services/data/biomech'
import { FOOT_H, FOOT_W, INSOLE_PATH } from '~/utils/pressure'
import type { ServiceGraphic } from '~/features/services/data/services'

defineProps<{ kind: ServiceGraphic; active: boolean }>()
</script>

<template>
  <!-- Estudio biomecánico: huella con mapa de presión ilustrativo -->
  <svg
    v-if="kind === 'pressure'"
    class="graphic"
    :viewBox="`-8 -8 ${FOOT_W * 2 + 40} ${FOOT_H + 16}`"
    aria-hidden="true"
    focusable="false"
  >
    <g>
      <PressureMap
        side="left"
        :state="active ? pressureStates.toeOff : pressureStates.standing"
        :duration="0.9"
      />
    </g>
    <g :transform="`translate(${FOOT_W + 24} 0)`">
      <PressureMap
        side="right"
        :state="active ? pressureStates.heelStrike : pressureStates.standingAlt"
        :duration="0.9"
      />
    </g>
  </svg>

  <!-- Plantillas: tres capas que se separan -->
  <svg
    v-else-if="kind === 'insole'"
    class="graphic insole"
    :class="{ 'is-active': active }"
    viewBox="0 0 300 220"
    aria-hidden="true"
    focusable="false"
  >
    <!-- Cada capa se desplaza en vertical de pantalla (g exterior); la plantilla, tumbada y en perspectiva -->
    <g v-for="n in [3, 2, 1]" :key="n" class="layer" :class="`layer-${n}`">
      <path :d="INSOLE_PATH" transform="translate(150 112) scale(1 0.42) rotate(-80) translate(-58 -137)" />
    </g>
  </svg>

  <!-- Podología general: dedo con uña, líneas de cuidado -->
  <svg
    v-else-if="kind === 'nail'"
    class="graphic nail"
    :class="{ 'is-active': active }"
    viewBox="0 0 200 160"
    aria-hidden="true"
    focusable="false"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M60 150V78c0-30 18-52 40-52s40 22 40 52v72" stroke="var(--color-primary)" stroke-width="2" />
    <path
      class="nail-plate"
      d="M76 70c0-16 10-28 24-28s24 12 24 28c0 6-4 10-10 10H86c-6 0-10-4-10-10Z"
      fill="var(--color-ice-blue)"
      stroke="var(--color-cyan)"
      stroke-width="1.5"
    />
    <path
      class="spark"
      d="M150 40l8-8M156 58h11M44 40l-8-8M38 58H27"
      stroke="var(--color-cyan)"
      stroke-width="2"
    />
  </svg>

  <!-- Infantil: huellas que crecen -->
  <svg
    v-else-if="kind === 'growth'"
    class="graphic growth"
    :class="{ 'is-active': active }"
    viewBox="0 0 140 64"
    aria-hidden="true"
    focusable="false"
  >
    <g
      v-for="(s, i) in [0.13, 0.17, 0.21]"
      :key="i"
      class="step"
      :style="{ '--i': i }"
      :transform="`translate(${8 + i * 42} ${60 - FOOT_H * s}) scale(${s})`"
    >
      <Footprint :side="i % 2 ? 'left' : 'right'" variant="both" :stroke-width="6" />
    </g>
  </svg>

  <!-- Pie diabético: contorno con puntos de control -->
  <svg
    v-else
    class="graphic control"
    :class="{ 'is-active': active }"
    :viewBox="`-14 -10 ${FOOT_W + 28} ${FOOT_H + 20}`"
    aria-hidden="true"
    focusable="false"
  >
    <g style="--fp-fill: transparent">
      <Footprint variant="outline" :stroke-width="2.5" />
    </g>
    <circle
      v-for="(p, i) in [
        [56, 228],
        [30, 96],
        [84, 104],
        [40, 46],
        [70, 160],
      ]"
      :key="i"
      class="check"
      :style="{ '--i': i }"
      :cx="p[0]"
      :cy="p[1]"
      r="7"
    />
  </svg>
</template>

<style scoped>
.graphic {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Plantilla en capas */
.insole .layer {
  stroke-width: 1.5;
  transition: transform var(--dur-reveal) var(--ease-out-soft);
}
.insole .layer-1 {
  fill: var(--color-ice-blue);
  stroke: var(--color-cyan);
}
.insole .layer-1 {
  transform: translateY(-10px);
}
.insole .layer-2 {
  fill: color-mix(in srgb, var(--color-cyan) 55%, white);
  stroke: var(--color-cyan);
}
.insole .layer-3 {
  fill: var(--color-primary);
  stroke: var(--color-primary-strong);
  transform: translateY(10px);
}
.insole.is-active .layer-1 {
  transform: translateY(-34px);
}
.insole.is-active .layer-3 {
  transform: translateY(34px);
}

/* Uña */
.nail .nail-plate {
  transition: fill var(--dur-base) var(--ease-out-soft);
}
.nail.is-active .nail-plate {
  fill: white;
}
.nail .spark {
  opacity: 0;
  transform: scale(0.85);
  transform-origin: 100px 50px;
  transition:
    opacity var(--dur-base) var(--ease-out-soft),
    transform var(--dur-base) var(--ease-out-soft);
}
.nail.is-active .spark {
  opacity: 1;
  transform: none;
}

/* Huellas que crecen */
.growth .step {
  --fp-fill: var(--color-light-blue);
  transition: opacity var(--dur-base) var(--ease-out-soft);
}
.growth.is-active .step {
  animation: step-in 900ms var(--ease-out-soft) both;
  animation-delay: calc(var(--i) * 140ms);
}
@keyframes step-in {
  from {
    opacity: 0;
  }
}

/* Puntos de control */
.control .check {
  fill: white;
  stroke: var(--color-cyan);
  stroke-width: 2.5;
  transition: fill var(--dur-base) var(--ease-out-soft);
  transition-delay: calc(var(--i) * 80ms);
}
.control.is-active .check {
  fill: var(--color-cyan);
}

@media (prefers-reduced-motion: reduce) {
  .insole .layer,
  .nail .spark,
  .control .check {
    transition: none;
  }
  .growth.is-active .step {
    animation: none;
  }
}
</style>
