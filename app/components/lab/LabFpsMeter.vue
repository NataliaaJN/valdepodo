<script setup lang="ts">
/**
 * Medidor de FPS del laboratorio (solo /_lab). Media de fotogramas por segundo y peor fotograma del último
 * segundo, para comprobar el criterio del Gate 3 (≥ 55 fps en escritorio medio, sin tirones en móvil).
 */
const fps = ref(0)
const worst = ref(0)
let raf = 0
let last = 0
let windowStart = 0
let frames = 0
let worstFrame = 0

function tick(now: number) {
  if (last) {
    const dt = now - last
    worstFrame = Math.max(worstFrame, dt)
  }
  last = now
  frames++
  if (now - windowStart >= 1000) {
    fps.value = Math.round((frames * 1000) / (now - windowStart))
    worst.value = Math.round(worstFrame)
    frames = 0
    worstFrame = 0
    windowStart = now
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  windowStart = performance.now()
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <div
    class="fixed right-3 bottom-3 z-50 rounded-s bg-deep-blue/90 px-3 py-2 font-mono text-xs text-white tabular-nums shadow-float"
    aria-hidden="true"
  >
    {{ fps }} fps · peor {{ worst }} ms
  </div>
</template>
