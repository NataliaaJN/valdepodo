<script setup lang="ts">
/**
 * Índice de servicios (/servicios): cinco filas editoriales, una por servicio, con la fotografía y el texto
 * en columnas que se alternan (foto a la derecha, a la izquierda…). Cada fila ocupa como mucho una pantalla
 * y se lee entera sin scroll-jacking: número, nombre, qué es, «Te ayuda si…» y un único enlace.
 * Fotografía: monocromo azul de marca en reposo y color al señalarla (mismo tratamiento que `ServiceTile`).
 * Táctil: sin hover, así que la foto se muestra siempre en color.
 */
import { getServiceMedia, mediaSrcset } from '~/data/service-media'
import { servicePath, services } from '~/data/services'

const total = String(services.length).padStart(2, '0')

const rows = services.map((service) => {
  const media = getServiceMedia(service.slug)
  return { service, media, srcset: mediaSrcset(media.src) }
})
</script>

<template>
  <ol class="rows" role="list">
    <li
      v-for="({ service, media, srcset }, i) in rows"
      :id="`svc-${service.slug}`"
      :key="service.slug"
      class="row"
      :class="[i % 2 === 0 ? 'chapter-bone' : 'chapter-bone-2', { 'row--flip': i % 2 === 1 }]"
    >
      <div class="container-wide row__inner">
        <div v-reveal class="row__text">
          <p class="eyebrow row__index">
            <span class="row__num">{{ service.number }}</span> / {{ total }}
          </p>
          <h2 class="row__name">{{ service.name }}</h2>
          <ContentValue :value="service.description" as="p" class="row__desc" />

          <div class="row__needs">
            <p class="eyebrow row__needs-title">Te ayuda si…</p>
            <ul role="list">
              <li v-for="(need, n) in service.needs.slice(0, 2)" :key="n">
                <ContentValue :value="need" />
              </li>
            </ul>
          </div>

          <BaseButton :to="servicePath(service.slug)" variant="primary" arrow class="row__cta">
            Ver {{ service.name.toLowerCase() }}
          </BaseButton>
        </div>

        <NuxtLink
          v-reveal="1"
          :to="servicePath(service.slug)"
          class="row__photo"
          tabindex="-1"
          aria-hidden="true"
        >
          <img
            :src="media.src"
            :srcset="srcset"
            :sizes="srcset ? '(min-width: 1024px) 56vw, 100vw' : undefined"
            alt=""
            width="1600"
            height="1200"
            :loading="i === 0 ? 'eager' : 'lazy'"
            decoding="async"
            draggable="false"
            :style="{ objectPosition: media.focus }"
          />
          <span class="row__tint" />
        </NuxtLink>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.row {
  border-top: 1px solid var(--color-border);
  padding-block: clamp(2.5rem, 6vw, 5.5rem);
  scroll-margin-top: calc(var(--nav-h-compact) + 8px);
}
.row__inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

/* ---------- Texto ---------- */
.row__text {
  display: grid;
  align-content: center;
  justify-items: start;
  gap: 1.25rem;
  min-width: 0;
}
.row__index {
  color: var(--color-text-secondary);
}
.row__num {
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
}
.row__name {
  max-width: 12ch;
  font-size: var(--text-display-m);
  line-height: var(--text-display-m--line-height);
  color: var(--color-ink);
}
.row__desc {
  max-width: 40ch;
  font-size: var(--text-body-l);
  line-height: var(--text-body-l--line-height);
  color: var(--color-text);
}
.row__needs {
  width: 100%;
  max-width: 40ch;
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
}
.row__needs-title {
  color: var(--color-text-secondary);
}
.row__needs li {
  padding-block: 0.625rem;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-body);
  line-height: var(--text-body--line-height);
  color: var(--color-text);
}
.row__needs ul {
  margin-top: 0.5rem;
}
.row__cta {
  margin-top: 0.5rem;
}

/* ---------- Fotografía ---------- */
.row__photo {
  position: relative;
  isolation: isolate;
  display: block;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-m);
  background: var(--color-ink);
  /* Safari: recorte con radio también durante el zoom */
  transform: translateZ(0);
}
.row__photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  scale: 1;
  transition:
    scale var(--dur-image) var(--ease-out-soft),
    filter 1000ms var(--ease-out-soft);
}
/* Capa de color de marca en multiply: monocromo azul en reposo */
.row__tint {
  position: absolute;
  inset: 0;
  background: var(--color-cyan-light);
  mix-blend-mode: multiply;
  opacity: 0;
  pointer-events: none;
  transition: opacity 1000ms var(--ease-out-soft);
}
@media (hover: hover) and (pointer: fine) {
  .row__photo img {
    filter: grayscale(1) contrast(1.08) brightness(1.05);
  }
  .row__tint {
    opacity: 0.95;
  }
  .row__photo:hover img,
  .row:has(.row__cta:hover) .row__photo img,
  .row:has(.row__cta:focus-visible) .row__photo img {
    filter: grayscale(0) contrast(1.02) brightness(1);
    scale: 1.03;
  }
  .row__photo:hover .row__tint,
  .row:has(.row__cta:hover) .row__tint,
  .row:has(.row__cta:focus-visible) .row__tint {
    opacity: 0.18;
  }
}

/* Móvil y tablet: la foto va antes del texto (en el DOM va después para que el h2 sea lo primero) */
@media (max-width: 1023px) {
  .row__photo {
    order: -1;
  }
}

/* ---------- Escritorio: dos columnas que se alternan ---------- */
@media (min-width: 1024px) {
  .row__inner {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
    align-items: center;
  }
  .row__text {
    grid-column: 1 / span 5;
    grid-row: 1;
  }
  .row__photo {
    grid-column: 6 / span 7;
    grid-row: 1;
  }
  .row--flip .row__text {
    grid-column: 8 / span 5;
  }
  .row--flip .row__photo {
    grid-column: 1 / span 7;
  }
}

@media (prefers-reduced-motion: reduce) {
  .row__photo img,
  .row__tint {
    transition:
      filter 200ms linear,
      opacity 200ms linear;
  }
  .row__photo:hover img,
  .row:has(.row__cta:hover) .row__photo img {
    scale: 1;
  }
}
</style>
