<script setup lang="ts">
/**
 * Loading de marca (spec 02 §1), versión reducida.
 *
 * El SVG del logo es un calco automático sin curvas (research §8.1): sin el vector original o un redibujado
 * aprobado por la clínica **no se implementa la transformación huella → logo** (sería inventar marca). La
 * spec permite, como mucho, un fundido simple: eso es lo que hay aquí (≈ 1,3 s, solo CSS).
 *
 * - Solo la primera visita de la sesión: un script inline en <head> (app.vue) decide antes del primer
 *   pintado y pone `data-intro="play|skip"` en <html>. Sin JS no existe el atributo y el overlay no se ve.
 * - `prefers-reduced-motion` → skip. No espera a ningún recurso. Scroll, tecla o toque → sale ya.
 * - `aria-hidden`: el contenido real está renderizado debajo y es accesible.
 * - Seguridad: la animación CSS termina sola aunque falle el JS de la página.
 */
const root = ref<HTMLElement | null>(null)
const EVENTS = ['wheel', 'keydown', 'pointerdown', 'touchstart'] as const

function finish() {
  document.documentElement.dataset.intro = 'done'
  for (const e of EVENTS) window.removeEventListener(e, leave)
}
function leave() {
  root.value?.classList.add('is-leaving')
  window.setTimeout(finish, 250)
}

onMounted(() => {
  if (document.documentElement.dataset.intro !== 'play') return
  for (const e of EVENTS) window.addEventListener(e, leave, { passive: true, once: true })
  root.value?.addEventListener('animationend', (e) => e.target === root.value && finish())
  window.setTimeout(finish, 2500)
})
onBeforeUnmount(finish)
</script>

<template>
  <div ref="root" class="brand-intro" aria-hidden="true">
    <div class="brand-intro__logo">
      <BrandLogo variant="full" label="" class="w-[min(38vw,168px)]" />
    </div>
  </div>
</template>

<style>
/* Sin ámbito: depende de un atributo de <html> que Vue no controla. */
.brand-intro {
  display: none;
}
html[data-intro='play'] .brand-intro {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  pointer-events: none;
  background:
    radial-gradient(50% 50% at 50% 50%, rgb(185 229 243 / 0.55), transparent 70%), var(--color-surface);
  animation: intro-out 380ms var(--ease-in-out-soft) 950ms both;
}
html[data-intro='play'] .brand-intro__logo {
  animation: intro-logo 900ms var(--ease-out-soft) both;
}
html[data-intro='play'] .brand-intro.is-leaving {
  animation: intro-out 220ms linear both;
}
@keyframes intro-logo {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
}
@keyframes intro-out {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
</style>
