<script setup lang="ts">
/**
 * Fachada del mapa (spec 07 §3). Estado inicial (SSR): ilustración propia del entorno con marcador de
 * marca, aviso de cookies y dos acciones. El <iframe> de Google Maps solo se inserta al pulsar "Ver mapa
 * interactivo"; la preferencia se recuerda en localStorage (solo la preferencia, ningún dato personal).
 */
import { mapEmbedUrl } from '~/utils/clinic'

const STORAGE_KEY = 'vp-map-consent'
const clinic = useClinic()
const loaded = ref(false)

function load() {
  loaded.value = true
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    /* almacenamiento no disponible: solo se pierde el recuerdo de la preferencia */
  }
}

onMounted(() => {
  try {
    if (localStorage.getItem(STORAGE_KEY) === '1') loaded.value = true
  } catch {
    /* sin almacenamiento */
  }
})
</script>

<template>
  <div class="map-facade">
    <iframe
      v-if="loaded"
      :src="mapEmbedUrl(clinic.geo)"
      title="Mapa de ubicación de Valdepodo"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      class="map-frame"
    />
    <div v-else class="map-placeholder">
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        class="map-art"
        aria-hidden="true"
        focusable="false"
      >
        <!-- Calles esquemáticas (ilustración propia, no es un mapa real) -->
        <path class="street" d="M-20 210 C 80 190, 160 200, 420 150" />
        <path class="street" d="M120 -20 C 140 80, 150 180, 170 320" />
        <path class="street thin" d="M-20 80 C 100 100, 260 70, 420 90" />
        <path class="street thin" d="M280 -20 C 270 100, 250 200, 300 320" />
        <path class="street thin" d="M-20 280 C 120 260, 220 280, 420 250" />
        <rect class="block" x="180" y="96" width="62" height="44" rx="6" />
        <rect class="block" x="30" y="110" width="70" height="60" rx="6" />
        <rect class="block" x="300" y="170" width="80" height="50" rx="6" />
        <g transform="translate(206 150)">
          <circle r="34" class="pin-halo" />
          <path
            class="pin"
            d="M0 0 C -14 -16, -18 -24, -18 -32 A 18 18 0 1 1 18 -32 C 18 -24, 14 -16, 0 0 Z"
          />
          <circle cy="-32" r="6" fill="var(--color-white)" />
        </g>
      </svg>
      <div class="map-overlay glass">
        <p class="text-sm text-text">Al cargar el mapa, Google puede instalar cookies en tu navegador.</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <BaseButton size="sm" @click="load">Ver mapa interactivo</BaseButton>
          <BaseButton size="sm" variant="secondary" :href="clinic.directions" target="_blank" rel="noopener">
            Cómo llegar<span class="sr-only"> (se abre en Google Maps)</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-facade {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-l);
  border: 1px solid var(--color-border);
  aspect-ratio: 4 / 3;
  background: var(--color-light-blue);
}
@media (min-width: 1024px) {
  .map-facade {
    aspect-ratio: auto;
    height: 100%;
    min-height: 560px;
  }
}
.map-frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}
.map-placeholder {
  position: absolute;
  inset: 0;
}
.map-art {
  width: 100%;
  height: 100%;
}
.street {
  fill: none;
  stroke: var(--color-white);
  stroke-width: 14;
  stroke-linecap: round;
}
.street.thin {
  stroke-width: 7;
}
.block {
  fill: var(--color-ice-blue);
  opacity: 0.6;
}
.pin-halo {
  fill: rgb(30 171 225 / 0.18);
  stroke: var(--color-cyan);
  stroke-dasharray: 2 5;
}
.pin {
  fill: var(--color-primary);
}
.map-overlay {
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  border-radius: var(--radius-m);
  padding: 1rem 1.25rem;
}
@media (min-width: 768px) {
  .map-overlay {
    right: auto;
    max-width: 24rem;
  }
}
</style>
