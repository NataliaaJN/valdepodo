<script setup lang="ts">
/**
 * Fondo del hero de la Home: «fluido celeste». Seda azul/lila con luz especular (SVG feTurbulence +
 * iluminación, se rasteriza una sola vez) sobre un degradado cian-azul-lila, con un velo de cian muy
 * claro que despeja la zona del pie 3D (derecha) y el lado del titular (izquierda), y grano fino.
 *
 * Solo anima un `transform` lento de la capa de seda; se apaga con reduced motion o en nivel `static`.
 * Las demás variantes probadas viven en la rama `feature/hero-background-pruebas`.
 */
defineProps<{ animate?: boolean }>()

const uid = useId().replace(/[^a-z0-9]/gi, '')
</script>

<template>
  <div class="bd" :class="{ 'bd--animate': animate }" aria-hidden="true">
    <svg class="bd__silk" preserveAspectRatio="none">
      <defs>
        <filter :id="`silk-${uid}`" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0013 0.0034"
            numOctaves="2"
            seed="11"
            result="n"
          />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3.4 -1.2"
            result="na"
          />
          <feGaussianBlur in="na" stdDeviation="14" result="nb" />
          <feDiffuseLighting
            in="nb"
            surfaceScale="9"
            diffuseConstant="1.05"
            lighting-color="#ffffff"
            result="d"
          >
            <feDistantLight azimuth="235" elevation="46" />
          </feDiffuseLighting>
          <feSpecularLighting
            in="nb"
            surfaceScale="9"
            specularConstant="1.25"
            specularExponent="26"
            lighting-color="#ffffff"
            result="s"
          >
            <feDistantLight azimuth="235" elevation="46" />
          </feSpecularLighting>
          <feComposite in="s" in2="d" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="lit" />
          <feGaussianBlur in="lit" stdDeviation="2.2" />
        </filter>
      </defs>
      <rect width="100%" height="100%" :filter="`url(#silk-${uid})`" />
    </svg>
    <div class="bd__tint" />
    <div class="bd__clear" />
    <div class="bd__grain" />
    <div class="bd__vignette" />
  </div>
</template>

<style scoped>
.bd {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: linear-gradient(165deg, #c9e8fb 0%, #9fc6f3 55%, #a9a8ee 100%);
}

/* Seda: sobredimensionada y girada para que los pliegues corran en diagonal; hueco en el centro del pie */
.bd__silk {
  position: absolute;
  inset: -30%;
  width: 160%;
  height: 160%;
  rotate: -16deg;
  mix-blend-mode: overlay;
  opacity: 0.7;
  -webkit-mask-image: radial-gradient(ellipse 34% 42% at 74% 48%, transparent 0%, #000 100%);
  mask-image: radial-gradient(ellipse 34% 42% at 74% 48%, transparent 0%, #000 100%);
}
.bd--animate .bd__silk {
  animation: silk-drift 38s ease-in-out infinite alternate;
}
@keyframes silk-drift {
  from {
    transform: translate3d(-3%, -1%, 0) scale(1.02);
  }
  to {
    transform: translate3d(3%, 2%, 0) scale(1.08);
  }
}

/* Cian muy muy claro donde antes había blanco */
.bd__tint {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(50% 60% at 78% 45%, rgb(224 250 255 / 0.5), rgb(224 250 255 / 0) 70%),
    radial-gradient(60% 50% at 0% 100%, rgb(160 190 255 / 0.55), rgb(160 190 255 / 0) 70%),
    radial-gradient(50% 50% at 10% 0%, rgb(224 250 255 / 0.85), rgb(224 250 255 / 0) 70%);
}
.bd__clear {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 36% 46% at 74% 48%, rgb(224 250 255 / 0.62), rgb(224 250 255 / 0) 100%);
}

.bd__grain {
  position: absolute;
  inset: 0;
  opacity: 0.22;
  mix-blend-mode: soft-light;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 1.4 -.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
}
/* Aclara el lado del titular para asegurar el contraste del texto oscuro */
.bd__vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgb(224 250 255 / 0.78) 0%, rgb(224 250 255 / 0) 62%);
}
</style>
