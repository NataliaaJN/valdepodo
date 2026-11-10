<script setup lang="ts">
/**
 * Mosaico de la clínica (spec 05 §3): principal grande (7 col) + 2 secundarias apiladas (5 col) + fila de
 * detalles con recorte redondeado, desalineados. Móvil: principal a ancho completo + carrusel con
 * scroll-snap para el resto.
 * Lightbox accesible con <dialog> nativo: flechas y teclado, Esc, foco atrapado (lo hace el navegador con
 * showModal), contador "2 / 7" y deslizar en táctil. Las fotos pendientes no abren lightbox.
 */
import { resolveValue } from '#shared/utils/pending'
import type { ClinicPhoto } from '~/data/clinic'

const props = defineProps<{ photos: readonly ClinicPhoto[] }>()

const main = computed(() => props.photos[0])
const side = computed(() => props.photos.slice(1, 3))
const details = computed(() => props.photos.slice(3))
const viewable = computed(() => props.photos.filter((p) => p.src))

const dialog = ref<HTMLDialogElement | null>(null)
const current = ref(0)
let opener: HTMLElement | null = null

function openAt(photo: ClinicPhoto, e: Event) {
  const index = viewable.value.indexOf(photo)
  if (index < 0) return
  opener = e.currentTarget as HTMLElement
  current.value = index
  dialog.value?.showModal()
}
function close() {
  dialog.value?.close()
}
function step(delta: number) {
  const n = viewable.value.length
  current.value = (current.value + delta + n) % n
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'ArrowLeft') step(-1)
}
let touchX = 0
const onTouchStart = (e: TouchEvent) => (touchX = e.touches[0]?.clientX ?? 0)
function onTouchEnd(e: TouchEvent) {
  const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
}
const onClose = () => opener?.focus()
</script>

<template>
  <div class="mosaic">
    <figure v-if="main" v-reveal class="m-main">
      <component
        :is="main.src ? 'button' : 'div'"
        :type="main.src ? 'button' : undefined"
        class="m-frame"
        :aria-label="main.src ? `Ampliar: ${resolveValue(main.alt)}` : undefined"
        @click="openAt(main, $event)"
      >
        <img v-if="main.src" :src="main.src" :alt="resolveValue(main.alt)" class="m-img" />
        <PhotoPlaceholder v-else ratio="4 / 3" class="m-img" />
      </component>
      <figcaption class="m-caption"><ContentValue :value="main.caption" /></figcaption>
    </figure>

    <div class="m-rest">
      <figure
        v-for="(photo, i) in [...side, ...details]"
        :key="i"
        v-reveal="i"
        class="m-item"
        :class="i < 2 ? 'is-side' : 'is-detail'"
      >
        <component
          :is="photo.src ? 'button' : 'div'"
          :type="photo.src ? 'button' : undefined"
          class="m-frame"
          :aria-label="photo.src ? `Ampliar: ${resolveValue(photo.alt)}` : undefined"
          @click="openAt(photo, $event)"
        >
          <img
            v-if="photo.src"
            :src="photo.src"
            :alt="resolveValue(photo.alt)"
            loading="lazy"
            class="m-img"
          />
          <PhotoPlaceholder v-else :ratio="i < 2 ? '16 / 10' : '1 / 1'" class="m-img" />
        </component>
        <figcaption class="m-caption"><ContentValue :value="photo.caption" /></figcaption>
      </figure>
    </div>
    <p class="m-hint" aria-hidden="true">Desliza para ver más</p>

    <dialog
      ref="dialog"
      class="lightbox"
      aria-label="Galería de la clínica"
      @keydown="onKey"
      @close="onClose"
      @click.self="close"
    >
      <div v-if="viewable.length" class="lb-inner" @touchstart.passive="onTouchStart" @touchend="onTouchEnd">
        <img :src="viewable[current]!.src!" :alt="resolveValue(viewable[current]!.alt)" class="lb-img" />
        <div class="lb-bar">
          <p aria-live="polite">{{ current + 1 }} / {{ viewable.length }}</p>
          <div class="flex gap-2">
            <button type="button" class="lb-btn" aria-label="Foto anterior" @click="step(-1)">
              <BaseIcon name="arrow-left" />
            </button>
            <button type="button" class="lb-btn" aria-label="Foto siguiente" @click="step(1)">
              <BaseIcon name="arrow-right" />
            </button>
            <button type="button" class="lb-btn" aria-label="Cerrar galería" @click="close">
              <BaseIcon name="close" />
            </button>
          </div>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.mosaic {
  display: grid;
  gap: 1.25rem;
}
.m-frame {
  display: block;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-l);
}
button.m-frame {
  cursor: zoom-in;
}
.m-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 600ms var(--ease-out-soft);
}
@media (hover: hover) and (pointer: fine) {
  button.m-frame:hover .m-img {
    transform: scale(1.05);
  }
}
.m-caption {
  margin-top: 0.6rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}
.is-detail .m-frame {
  border-radius: var(--radius-m);
}

/* Móvil: carrusel con scroll-snap para el resto */
.m-rest {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 72%;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
}
.m-item {
  scroll-snap-align: start;
}
.m-hint {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

@media (min-width: 768px) {
  .mosaic {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 1.5rem;
    align-items: start;
  }
  .m-main {
    grid-column: 1 / span 7;
    grid-row: 1 / span 2;
  }
  .m-rest {
    display: contents;
  }
  .m-hint {
    display: none;
  }
  .is-side {
    grid-column: 8 / span 5;
  }
  .is-side:nth-child(1) {
    grid-row: 1;
  }
  .is-side:nth-child(2) {
    grid-row: 2;
  }
  .is-detail {
    grid-column: span 4;
  }
  .is-detail:nth-child(3) {
    grid-column: 2 / span 3;
    margin-top: 2rem;
  }
  .is-detail:nth-child(4) {
    grid-column: 6 / span 3;
  }
  .is-detail:nth-child(5) {
    grid-column: 10 / span 3;
    margin-top: 4rem;
  }
}

.lightbox {
  width: min(92vw, 1100px);
  max-height: 92vh;
  margin: auto;
  border: 0;
  border-radius: var(--radius-l);
  background: var(--color-deep-blue);
  padding: 0;
  color: var(--color-white);
}
.lightbox::backdrop {
  background: rgb(22 60 99 / 0.75);
  backdrop-filter: blur(6px);
}
.lb-img {
  display: block;
  width: 100%;
  max-height: 78vh;
  object-fit: contain;
}
.lb-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
}
.lb-btn {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / 0.3);
}
.lb-btn:hover {
  background: rgb(255 255 255 / 0.1);
}
</style>
