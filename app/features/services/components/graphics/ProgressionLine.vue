<script setup lang="ts">
/**
 * Línea de progresión de la marcha (spec 08 §3): curva suave discontinua que une una secuencia de puntos y
 * termina en una punta de flecha. `<g>` en las coordenadas del `<svg>` contenedor. `progress` (0..1) la dibuja.
 */
const props = withDefaults(
  defineProps<{ points: readonly { x: number; y: number }[]; progress?: number; arrow?: boolean }>(),
  { progress: 1, arrow: true },
)

const uid = useId()

/** Catmull-Rom → Bézier cúbica: pasa por todos los puntos. */
const d = computed(() => {
  const p = props.points
  if (p.length < 2) return ''
  let out = `M${p[0]!.x} ${p[0]!.y}`
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i]!
    const p1 = p[i]!
    const p2 = p[i + 1]!
    const p3 = p[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    out += `C${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`
  }
  return out
})

/** Punta de flecha orientada según el último tramo. */
const head = computed(() => {
  const p = props.points
  const a = p[p.length - 2]
  const b = p[p.length - 1]
  if (!a || !b) return ''
  const ang = Math.atan2(b.y - a.y, b.x - a.x)
  const s = 7
  const l = { x: b.x - s * Math.cos(ang - 0.5), y: b.y - s * Math.sin(ang - 0.5) }
  const r = { x: b.x - s * Math.cos(ang + 0.5), y: b.y - s * Math.sin(ang + 0.5) }
  return `M${l.x} ${l.y}L${b.x} ${b.y}L${r.x} ${r.y}`
})
</script>

<template>
  <g class="progression">
    <defs>
      <mask :id="`${uid}-reveal`" maskUnits="userSpaceOnUse">
        <path
          :d="d"
          pathLength="1"
          stroke="#fff"
          stroke-width="12"
          fill="none"
          :stroke-dashoffset="1 - progress"
        />
      </mask>
    </defs>
    <g :mask="`url(#${uid}-reveal)`">
      <path :d="d" class="pl-line" />
    </g>
    <path v-if="arrow" :d="head" class="pl-head" :style="{ opacity: progress >= 0.98 ? 1 : 0 }" />
  </g>
</template>

<style scoped>
.progression path {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.pl-line {
  stroke: var(--pl-color, var(--color-cyan));
  stroke-width: 1.6;
  stroke-dasharray: 4 6;
}
.pl-head {
  stroke: var(--pl-color, var(--color-cyan));
  stroke-width: 1.8;
  transition: opacity var(--dur-base) ease;
}
.progression mask path {
  stroke-dasharray: 1 1;
}
</style>
