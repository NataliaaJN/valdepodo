<script setup lang="ts">
/**
 * Hero editorial con fotografía de fondo (página «La clínica»): imagen a sangre bajo la navbar, un velo de
 * tinta que garantiza el contraste del texto y una composición mínima: etiqueta, titular y una entradilla.
 * Sin foto (`photo.src === null`) muestra el marcador «Fotografía pendiente» (nunca stock, spec 09 §2).
 */
import { resolveValue, type Maybe } from '#shared/utils/pending'

defineProps<{
  title: string
  eyebrow?: string
  photo: { src: string | null; alt: Maybe<string> }
  /** Vídeo de fondo (silencioso, en bucle). La foto hace de póster y de alternativa con movimiento reducido. */
  video?: string
  /** Punto focal de la foto/vídeo (`object-position`). */
  focus?: string
  id?: string
}>()
defineSlots<{ default?: () => unknown; crumbs?: () => unknown }>()
</script>

<template>
  <header class="hero under-navbar section-clip relative isolate" data-nav-theme="ink">
    <div class="hero__media" aria-hidden="true">
      <img
        v-if="photo.src"
        :src="photo.src"
        :alt="resolveValue(photo.alt)"
        width="1600"
        height="900"
        fetchpriority="high"
        decoding="async"
        class="hero__img"
        :style="{ objectPosition: focus }"
      />
      <video
        v-if="video"
        class="hero__img hero__video"
        :src="video"
        :poster="photo.src ?? undefined"
        :style="{ objectPosition: focus }"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        aria-hidden="true"
      />
      <PhotoPlaceholder
        v-if="!photo.src && !video"
        label="Fotografía del equipo pendiente"
        ratio="16 / 9"
        class="hero__img"
      />
    </div>
    <div class="hero__scrim" aria-hidden="true" />

    <!-- Migas de pan (páginas de servicio): arriba, bajo la navbar -->
    <div v-if="$slots.crumbs" class="container-wide hero__crumbs">
      <slot name="crumbs" />
    </div>

    <div class="container-wide hero__inner">
      <p v-if="eyebrow" v-reveal class="eyebrow hero__eyebrow">{{ eyebrow }}</p>
      <h1 :id="id ?? 'page-title'" v-reveal class="hero__title">{{ title }}</h1>
      <div v-if="$slots.default" v-reveal="1" class="hero__lede text-body-l">
        <slot />
      </div>
    </div>
  </header>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: flex-end;
  min-height: 100svh;
  background: var(--color-ink);
  color: var(--color-bone);
}
.hero__media {
  position: absolute;
  z-index: -2;
  inset: 0;
}
.hero__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 58%;
}
img.hero__img,
video.hero__img {
  display: block;
}
.hero__video {
  position: absolute;
  inset: 0;
}
@media (prefers-reduced-motion: reduce) {
  .hero__video {
    display: none;
  }
}
/* Velo de tinta: algo arriba (navbar legible) y firme abajo (titular) */
.hero__scrim {
  position: absolute;
  z-index: -1;
  inset: 0;
  background:
    linear-gradient(to bottom, rgb(6 26 44 / 0.5) 0%, rgb(6 26 44 / 0) 24%),
    linear-gradient(to top, rgb(6 26 44 / 0.88) 0%, rgb(6 26 44 / 0.5) 42%, rgb(6 26 44 / 0.12) 78%);
}

.hero__crumbs {
  position: absolute;
  inset-inline: 0;
  top: calc(var(--nav-h) + 1rem);
  margin-inline: auto;
  color: var(--color-bone);
  text-shadow: 0 1px 14px rgb(6 26 44 / 0.55);
}
.hero__inner {
  display: grid;
  gap: 1.25rem;
  padding-block: clamp(3rem, 6vw, 5.5rem) clamp(2.5rem, 5vw, 4.5rem);
}
.hero__eyebrow {
  color: var(--color-ice-blue);
}
.hero__title {
  max-width: 13ch;
  font-size: var(--text-display-l);
  line-height: var(--text-display-l--line-height);
  color: var(--color-bone);
}
.hero__lede {
  max-width: 38ch;
  color: rgb(241 239 233 / 0.9);
}

@media (min-width: 1024px) {
  .hero__inner {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
    row-gap: 1.25rem;
    align-items: end;
  }
  .hero__eyebrow {
    grid-column: 1 / -1;
  }
  .hero__title {
    grid-column: 1 / span 8;
    max-width: 14ch;
  }
  .hero__lede {
    grid-column: 9 / span 4;
    padding-bottom: 0.5rem;
  }
}
</style>
