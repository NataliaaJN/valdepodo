<script setup lang="ts">
/**
 * Catálogo de servicios (/servicios): una cuadrícula de tarjetas con fotografía, sin numerar (ningún servicio
 * es «el primero»: cada uno responde a una necesidad distinta). Dos composiciones, no una repetición:
 *   - Escritorio: fila de dos tarjetas anchas (7 + 5 columnas) y fila de tres (4 + 4 + 4).
 *   - Tablet: dos columnas, la primera tarjeta a todo el ancho. Móvil: una columna, foto y luego texto.
 * Cada tarjeta es un único enlace (el del h2, extendido a toda la tarjeta). Hover: la tarjeta sube 2 px y la
 * foto hace zoom 1,03 dentro de su marco; táctil: la foto se muestra siempre en color.
 * Fotografía: monocromo azul de marca en reposo y color al señalarla (tratamiento común con `ServiceTile`).
 * Sin pies de foto: la imagen no se explica.
 */
import { getServiceMedia, mediaSrcset } from '~/data/service-media'
import { servicePath, services } from '~/data/services'

const cards = services.map((service) => {
  const media = getServiceMedia(service.slug)
  return { service, media, srcset: mediaSrcset(media.src) }
})
</script>

<template>
  <ul class="catalog container-wide" role="list">
    <li
      v-for="({ service, media, srcset }, i) in cards"
      :key="service.slug"
      class="card"
      :class="`card--${i}`"
    >
      <div class="card__photo">
        <img
          :src="publicUrl(media.src)"
          :srcset="srcset"
          :sizes="srcset ? '(min-width: 1024px) 50vw, 100vw' : undefined"
          alt=""
          width="1600"
          height="1200"
          :loading="i < 2 ? 'eager' : 'lazy'"
          decoding="async"
          draggable="false"
          :style="{ objectPosition: media.focus }"
        />
        <span class="card__tint" />
      </div>
      <div class="card__body">
        <h2 class="card__name">
          <NuxtLink :to="servicePath(service.slug)" class="card__link">{{ service.name }}</NuxtLink>
        </h2>
        <ContentValue :value="service.description" as="p" class="card__desc" />
        <span class="card__more" aria-hidden="true">
          Ver el servicio
          <BaseIcon name="arrow-right" class="card__arrow" />
        </span>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.catalog {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(1.25rem, 2.4vw, 2rem);
  padding-block: clamp(2.5rem, 5vw, 4.5rem);
}

/* ---------- Tarjeta ---------- */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-radius: var(--radius-m);
  background: var(--color-light-blue);
  overflow: hidden;
  isolation: isolate;
  transition: translate 300ms var(--ease-out-soft);
}
.card__photo {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background: var(--color-ink);
  /* Safari: recorte con zoom */
  transform: translateZ(0);
}
.card__photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  scale: 1;
  transition:
    scale var(--dur-image) var(--ease-out-soft),
    filter 900ms var(--ease-out-soft);
}
.card__tint {
  position: absolute;
  inset: 0;
  background: var(--color-cyan-light);
  mix-blend-mode: multiply;
  opacity: 0;
  pointer-events: none;
  transition: opacity 900ms var(--ease-out-soft);
}

.card__body {
  display: grid;
  align-content: start;
  gap: 0.75rem;
  flex: 1;
  padding: clamp(1.25rem, 2vw, 1.75rem);
}
.card__name {
  font-size: var(--text-heading-s);
  line-height: var(--text-heading-s--line-height);
  color: var(--color-ink);
}
/* Un único enlace por tarjeta: su área cubre toda la tarjeta */
.card__link::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}
.card__link:focus-visible {
  outline: none;
}
.card:has(.card__link:focus-visible) {
  outline: 2px solid var(--color-ink);
  outline-offset: 3px;
}
.card__desc {
  max-width: 46ch;
  font-size: var(--text-body);
  line-height: var(--text-body--line-height);
  color: var(--color-text);
}
.card__more {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-weight: 600;
  color: var(--color-ink);
  background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat;
  justify-self: start;
  padding-bottom: 2px;
  transition: background-size 400ms var(--ease-out-soft);
}
.card__arrow {
  width: 1.1rem;
  height: 1.1rem;
  transition: translate 300ms var(--ease-out-soft);
}

/* Hover solo con puntero fino; en táctil, la foto siempre en color */
@media (hover: hover) and (pointer: fine) {
  .card__photo img {
    filter: grayscale(1) contrast(1.08) brightness(1.05);
  }
  .card__tint {
    opacity: 0.95;
  }
  .card:hover {
    translate: 0 -2px;
  }
  .card:hover .card__photo img {
    filter: grayscale(0) contrast(1.02) brightness(1);
    scale: 1.03;
  }
  .card:hover .card__tint {
    opacity: 0.18;
  }
  .card:hover .card__more {
    background-size: 100% 1px;
  }
  .card:hover .card__arrow {
    translate: 4px 0;
  }
}

/* ---------- Tablet: dos columnas, la primera a todo el ancho ---------- */
@media (min-width: 700px) {
  .catalog {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .card--0 {
    grid-column: 1 / -1;
  }
  .card--0 .card__photo {
    aspect-ratio: 21 / 9;
  }
}

/* ---------- Escritorio: 7 + 5 y 4 + 4 + 4 ---------- */
@media (min-width: 1024px) {
  .catalog {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
  .card--0 {
    grid-column: 1 / span 7;
  }
  .card--1 {
    grid-column: 8 / span 5;
  }
  .card--2,
  .card--3,
  .card--4 {
    grid-column: span 4;
  }
  .card--0 .card__photo,
  .card--1 .card__photo {
    aspect-ratio: 3 / 2;
  }
  /* Las dos tarjetas grandes comparten alto: la foto de la estrecha absorbe la diferencia */
  .card--1 .card__photo {
    aspect-ratio: auto;
    flex: 1;
    min-height: 0;
  }
  .card--0 .card__name,
  .card--1 .card__name {
    font-size: var(--text-display-m);
    line-height: var(--text-display-m--line-height);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card,
  .card__photo img,
  .card__tint,
  .card__more,
  .card__arrow {
    transition: none;
  }
  .card:hover,
  .card:hover .card__photo img {
    translate: 0;
    scale: 1;
  }
}
</style>
