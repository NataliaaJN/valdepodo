<script setup lang="ts">
/**
 * Composición editorial de los cinco servicios (sin forzar una rejilla 3×2):
 *   [   1   ][  2  ]
 *   [ 03 ][ 04 ][ 05 ]   ← el 04, más bajo y apoyado abajo, rompe la línea superior
 * Escritorio: 12 columnas con alturas de fila fijas · Tablet: 01 a todo el ancho y el resto de dos en dos ·
 * Móvil: una columna con proporciones alternas. `variant="index"` la agranda para la página de servicios.
 */
import { services } from '~/features/services/data/services'

withDefaults(defineProps<{ variant?: 'home' | 'index' }>(), { variant: 'home' })

const placement = [
  { size: 'xl', sizes: '(min-width: 1024px) 58vw, 100vw' },
  { size: 'l', sizes: '(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw' },
  { size: 'm', sizes: '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw' },
  { size: 'm', sizes: '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw' },
  { size: 'm', sizes: '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw' },
] as const
</script>

<template>
  <ul class="tiles" :class="`tiles--${variant}`" role="list">
    <li
      v-for="(service, i) in services"
      :key="service.slug"
      v-reveal="i"
      :class="`tiles__item tiles__item--${i + 1}`"
    >
      <ServiceTile
        :service="service"
        :size="placement[i]?.size"
        :sizes="placement[i]?.sizes"
        :eager="false"
      />
    </li>
  </ul>
</template>

<style scoped>
.tiles {
  --gap: clamp(0.625rem, 1.2vw, 1.25rem);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--gap);
}
.tiles__item {
  min-width: 0;
  aspect-ratio: 4 / 3;
}
.tiles__item--1 {
  aspect-ratio: 4 / 3;
}

@media (min-width: 768px) {
  .tiles {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .tiles__item {
    aspect-ratio: 4 / 5;
  }
  .tiles__item--1 {
    grid-column: 1 / -1;
    aspect-ratio: 16 / 9;
  }
}

@media (min-width: 1024px) {
  .tiles {
    --row-a: clamp(16rem, 21vw, 22rem);
    --row-b: clamp(14rem, 17vw, 18rem);
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-rows: var(--row-a) var(--row-b);
  }
  .tiles--index {
    --row-a: clamp(30rem, 44vw, 54rem);
    --row-b: clamp(26rem, 34vw, 42rem);
  }
  .tiles__item,
  .tiles__item--1 {
    aspect-ratio: auto;
    grid-column: auto;
  }
  .tiles__item--1 {
    grid-column: 1 / span 7;
  }
  .tiles__item--2 {
    grid-column: 8 / span 5;
  }
  .tiles__item--3 {
    grid-column: 1 / span 4;
  }
  .tiles__item--4 {
    grid-column: 5 / span 4;
    align-self: end;
    height: calc(100% - clamp(1.5rem, 2.5vw, 2.5rem));
  }
  .tiles__item--5 {
    grid-column: 9 / span 4;
  }
}
</style>
