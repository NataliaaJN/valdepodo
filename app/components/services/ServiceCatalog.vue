<script setup lang="ts">
/**
 * Índice de servicios (/servicios): una sola pantalla. Sin numerar (ningún servicio es «el primero»).
 *
 * Escritorio (≥ 1024 px): lista tipográfica a la izquierda y UNA fotografía grande a la derecha que cambia a la
 * del servicio señalado (con el puntero o con el teclado). El servicio activo se lee entero (nombre, descripción
 * y enlace); los demás quedan como nombres atenuados, así la lista cabe en la pantalla.
 * Tablet y móvil: no hay hover, así que cada servicio es una fila con su miniatura, nombre y descripción.
 *
 * Una sola `<img>` por servicio (en escritorio ocupa la columna derecha; en móvil es la miniatura de la fila).
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
          :sizes="srcset ? '(min-width: 1024px) 46vw, 40vw' : undefined"
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
            <ContentValue :value="service.description" as="p" class="item__desc" />
          </div>
        </div>
        <BaseIcon name="arrow-up-right" class="item__arrow" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.index {
  padding-block: clamp(1.5rem, 4vw, 3.5rem) clamp(2.5rem, 6vw, 5rem);
}
.index__list {
  position: relative;
}

/* ---------- Fila (móvil y tablet) ---------- */
.item {
  position: relative;
  display: grid;
  grid-template-columns: clamp(6.5rem, 28vw, 11rem) minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem clamp(1rem, 3vw, 1.75rem);
  padding-block: clamp(1rem, 2.5vw, 1.5rem);
  border-top: 1px solid var(--color-border);
}
.item:last-child {
  border-bottom: 1px solid var(--color-border);
}
.item__photo {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(--radius-m);
}
.item__text {
  display: grid;
  gap: 0.4rem;
  min-width: 0;
}
.item__name {
  font-size: var(--text-heading-s);
  line-height: var(--text-heading-s--line-height);
  color: var(--color-ink);
}
/* Un único enlace por fila: su área cubre toda la fila */
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
  outline-offset: 2px;
  border-radius: var(--radius-s);
}
.item__more {
  display: grid;
}
.item__desc {
  min-height: 0;
  overflow: hidden;
  font-size: var(--text-body);
  line-height: var(--text-body--line-height);
  color: var(--color-text-secondary);
}
.item__arrow {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-ink);
}
@media (max-width: 479px) {
  /* Móvil estrecho: la flecha sobra, la fila entera es el enlace */
  .item {
    grid-template-columns: 6.5rem minmax(0, 1fr);
  }
  .item__arrow {
    display: none;
  }
}

/* ---------- Escritorio: lista + fotografía única ---------- */
@media (min-width: 1024px) {
  .index__list {
    /* La lista ocupa la mitad izquierda; la fotografía, la derecha con el alto de la lista */
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    width: 52%;
    min-height: min(70svh, 40rem);
    align-content: start;
  }
  .item {
    grid-template-columns: minmax(0, 1fr) auto;
    padding-block: clamp(1.1rem, 2.2svh, 1.6rem);
    transition: translate 300ms var(--ease-out-soft);
  }
  .item__photo {
    position: absolute;
    top: 0;
    left: calc(100% + clamp(2rem, 4vw, 4rem));
    width: calc(100% * 46 / 52);
    height: 100%;
    aspect-ratio: auto;
    border-radius: var(--radius-m);
    opacity: 0;
    scale: 1;
    transition:
      opacity 500ms var(--ease-out-soft),
      scale var(--dur-image) var(--ease-out-soft);
    pointer-events: none;
  }
  /* La fila deja de ser la referencia de posición: la fotografía ocupa el alto de TODA la lista */
  .item {
    position: static;
  }
  .item__text {
    position: relative;
  }
  .item__link::after {
    inset: -1rem -1.25rem;
  }
  .item__name {
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
  .item__arrow {
    opacity: 0;
    translate: -6px 6px;
    transition:
      opacity 300ms var(--ease-out-soft),
      translate 300ms var(--ease-out-soft);
  }
  .item.is-active .item__photo {
    opacity: 1;
    scale: 1.015;
  }
  .item.is-active .item__name {
    color: var(--color-ink);
  }
  .item.is-active .item__more {
    grid-template-rows: 1fr;
  }
  .item.is-active .item__arrow {
    opacity: 1;
    translate: 0;
  }
  .item__desc {
    max-width: 44ch;
    font-size: var(--text-body-l);
    line-height: var(--text-body-l--line-height);
    color: var(--color-text);
  }
  .item.is-active .item__text {
    gap: 0.6rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .item,
  .item__photo,
  .item__name,
  .item__more,
  .item__arrow {
    transition: none;
  }
}
</style>
