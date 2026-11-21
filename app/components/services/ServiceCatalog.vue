<script setup lang="ts">
/**
 * Índice de servicios (/servicios): una sola pantalla. Sin numerar (ningún servicio es «el primero»).
 *
 * Escritorio y tablet (≥ 700 px): lista tipográfica a la izquierda y UNA fotografía grande a la derecha que cambia a la
 * del servicio señalado (con el puntero o con el teclado). El servicio activo se lee entero (nombre, descripción
 * y enlace); los demás quedan como nombres atenuados, así la lista cabe en la pantalla.
 * Tablet y escritorio (≥ 700 px): el mismo diseño.
 * Móvil (< 700 px): índice en filas sobre fondo hueso (nombre, resumen y miniatura), distinto de las piezas de
 * tinta de la landing y con los cinco servicios a la vista casi sin scroll.
 *
 * Una sola `<img>` por servicio (en escritorio ocupa la columna derecha; en móvil, el fondo de la tarjeta).
 * Sin pies de foto. Cada fila es un único enlace (el del h2, extendido a toda la fila).
 */
import { getServiceMedia, mediaSrcset } from '~/data/service-media'
import { servicePath, services } from '~/data/services'

const active = ref(0)

const items = services.map((service) => {
  const media = getServiceMedia(service.slug)
  return { service, media, srcset: mediaSrcset(media.src) }
})

function onEnter(i: number, e: PointerEvent) {
  if (e.pointerType === 'mouse') active.value = i
}
</script>

<template>
  <div class="index container-wide">
    <ul class="index__list" role="list">
      <li
        v-for="({ service, media, srcset }, i) in items"
        :key="service.slug"
        class="item"
        :class="{ 'is-active': active === i }"
        @pointerenter="onEnter(i, $event)"
        @focusin="active = i"
      >
        <img
          class="item__photo"
          :src="publicUrl(media.src)"
          :srcset="srcset"
          :sizes="srcset ? '(min-width: 700px) 46vw, 104px' : undefined"
          alt=""
          width="1600"
          height="1200"
          :loading="i === 0 ? 'eager' : 'lazy'"
          decoding="async"
          draggable="false"
          :style="{ objectPosition: media.focus }"
        />
        <div class="item__text">
          <h2 class="item__name">
            <NuxtLink :to="servicePath(service.slug)" class="item__link">{{ service.name }}</NuxtLink>
          </h2>
          <div class="item__more">
            <ContentValue :value="service.summary" as="p" class="item__desc item__desc--short" />
            <ContentValue :value="service.description" as="p" class="item__desc item__desc--full" />
          </div>
        </div>
        <span class="item__arrow" aria-hidden="true"><BaseIcon name="arrow-up-right" /></span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.index {
  padding-block: clamp(1rem, 3vw, 3.5rem) clamp(2.5rem, 6vw, 5rem);
}

/* ---------- Móvil: tarjetas de fotografía a sangre ---------- */
.index__list {
  display: grid;
  gap: 0.75rem;
}
.item {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: flex-end;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: var(--radius-m);
  background: var(--color-ink);
  color: var(--color-bone);
  /* Safari: recorte con radio */
  transform: translateZ(0);
}
.item__photo {
  position: absolute;
  z-index: -2;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* Velo de tinta: firme abajo (texto), casi nada arriba (la foto manda) */
.item::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 0;
  background: linear-gradient(to top, rgb(6 26 44 / 0.92) 0%, rgb(6 26 44 / 0.62) 38%, rgb(6 26 44 / 0) 72%);
}
.item__text {
  display: grid;
  gap: 0.5rem;
  width: 100%;
  padding: 1.25rem 4.5rem 1.375rem 1.25rem;
  min-width: 0;
}
.item__name {
  font-size: clamp(1.75rem, 1.2rem + 2.4vw, 2.5rem);
  line-height: 1.02;
  letter-spacing: -0.02em;
  color: var(--color-bone);
}
/* Un único enlace por tarjeta: su área cubre toda la tarjeta */
.item__link::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}
.item__link:focus-visible {
  outline: none;
}
.item:has(.item__link:focus-visible) {
  outline: 2px solid var(--color-ink);
  outline-offset: 3px;
}
.item__more {
  display: grid;
}
.item__desc {
  font-size: var(--text-body);
  line-height: 1.5;
  color: rgb(241 239 233 / 0.92);
}
/* Botón circular de flecha, abajo a la derecha */
.item__arrow {
  position: absolute;
  right: 1.125rem;
  bottom: 1.25rem;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  background: var(--color-bone);
  color: var(--color-ink);
  pointer-events: none;
}
.item__arrow :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
}

/* ---------- Móvil (< 700 px): filas con miniatura (anula las tarjetas de arriba) ---------- */
.item__desc--short {
  display: none;
}
@media (max-width: 699px) {
  .item__desc--short {
    display: block;
  }
  .item__desc--full {
    display: none;
  }
  .index__list {
    gap: 0;
    border-top: 1px solid var(--color-border);
  }
  .item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 6.5rem;
    grid-template-areas:
      'text photo'
      'arrow photo';
    grid-template-rows: auto 1fr;
    column-gap: 1.125rem;
    align-items: start;
    aspect-ratio: auto;
    overflow: visible;
    padding-block: 1.125rem;
    border-bottom: 1px solid var(--color-border);
    border-radius: 0;
    background: none;
    color: var(--color-ink);
    transform: none;
    -webkit-tap-highlight-color: transparent;
  }
  .item::before {
    display: none;
  }
  .item__photo {
    position: static;
    z-index: auto;
    grid-area: photo;
    width: 6.5rem;
    height: auto;
    aspect-ratio: 4 / 5;
    border-radius: var(--radius-s);
  }
  .item__text {
    grid-area: text;
    gap: 0.375rem;
    padding: 0;
  }
  .item__name {
    font-size: clamp(1.5rem, 1.1rem + 1.8vw, 1.875rem);
    line-height: 1.05;
    color: var(--color-ink);
    text-wrap: balance;
  }
  .item__link::after {
    inset: 0;
  }
  .item:has(.item__link:focus-visible) {
    outline-offset: 2px;
  }
  .item__desc {
    line-height: 1.45;
    color: var(--color-text);
  }
  .item__arrow {
    position: static;
    grid-area: arrow;
    align-self: end;
    width: auto;
    height: auto;
    margin-top: 0.5rem;
    border-radius: 0;
    background: none;
    color: var(--color-ink);
  }
  .item__arrow :deep(svg) {
    width: 1.5rem;
    height: 1.5rem;
  }
  .item:active .item__name {
    opacity: 0.6;
  }
}

/* ---------- Escritorio: lista + fotografía única ---------- */
@media (min-width: 700px) {
  .index__list {
    /* La lista ocupa la mitad izquierda; la fotografía, la derecha con el alto de la lista */
    position: relative;
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
    width: 52%;
    min-height: min(70svh, 40rem);
    align-content: start;
  }
  .item {
    position: static;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    aspect-ratio: auto;
    overflow: visible;
    border-radius: 0;
    background: none;
    color: var(--color-ink);
    transform: none;
    padding-block: clamp(1.1rem, 2.2svh, 1.6rem);
    border-top: 1px solid var(--color-border);
  }
  .item:first-child {
    grid-column: auto;
    aspect-ratio: auto;
  }
  .item:last-child {
    border-bottom: 1px solid var(--color-border);
  }
  .item::before {
    display: none;
  }
  .item:has(.item__link:focus-visible) {
    border-radius: var(--radius-s);
    outline-offset: 2px;
  }
  .item__photo {
    position: absolute;
    z-index: auto;
    inset: auto;
    top: 0;
    left: calc(100% + clamp(2rem, 4vw, 4rem));
    width: calc(100% * 46 / 52);
    height: 100%;
    border-radius: var(--radius-m);
    opacity: 0;
    scale: 1;
    transition:
      opacity 500ms var(--ease-out-soft),
      scale var(--dur-image) var(--ease-out-soft);
    pointer-events: none;
  }
  .item__text {
    position: relative;
    gap: 0;
    padding: 0;
    max-width: none;
  }
  .item:first-child .item__text {
    max-width: none;
  }
  .item__link::after {
    inset: -1rem -1.25rem;
  }
  .item__name,
  .item:first-child .item__name {
    font-size: clamp(1.75rem, 0.9rem + 2.2vw, 3.25rem);
    line-height: 1.05;
    letter-spacing: -0.02em;
    /* Atenuado salvo el activo: texto grande, contraste ≥ 3:1 */
    color: rgb(6 26 44 / 0.5);
    transition: color 300ms var(--ease-out-soft);
  }
  .item__more {
    grid-template-rows: 0fr;
    transition: grid-template-rows 450ms var(--ease-out-soft);
  }
  .item__desc {
    min-height: 0;
    overflow: hidden;
    max-width: 44ch;
    font-size: var(--text-body-l);
    line-height: var(--text-body-l--line-height);
    color: var(--color-text);
  }
  .item__arrow {
    position: static;
    width: 1.5rem;
    height: 1.5rem;
    background: none;
    border-radius: 0;
    opacity: 0;
    translate: -6px 6px;
    transition:
      opacity 300ms var(--ease-out-soft),
      translate 300ms var(--ease-out-soft);
  }
  .item__arrow :deep(svg) {
    width: 1.5rem;
    height: 1.5rem;
  }
  .item.is-active .item__photo {
    opacity: 1;
    scale: 1.015;
  }
  .item.is-active .item__name {
    color: var(--color-ink);
  }
  .item.is-active .item__text {
    gap: 0.6rem;
  }
  .item.is-active .item__more {
    grid-template-rows: 1fr;
  }
  .item.is-active .item__arrow {
    opacity: 1;
    translate: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .item__photo,
  .item__name,
  .item__more,
  .item__arrow {
    transition: none;
  }
}
</style>
