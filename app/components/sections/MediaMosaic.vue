<script setup lang="ts">
/**
 * Composición editorial del espacio de la clínica (spec 05 §3): imágenes de tamaños distintos y
 * desalineadas (una principal ancha, un retrato, un detalle cuadrado y una vista media), no una galería.
 * Las cuatro primeras componen la fila doble original; la quinta y la sexta (cuando lleguen más fotos)
 * continúan el mismo patrón en una tercera fila.
 * Móvil: principal a ancho completo, retrato y detalle en dos columnas y la vista media al final.
 * Lightbox accesible con <dialog> nativo: flechas y teclado, Esc, foco atrapado (lo hace el navegador con
 * showModal), contador "2 / 4" y deslizar en táctil. Las fotos pendientes no abren lightbox.
 */
import { resolveValue } from '#shared/utils/pending'
import type { ClinicPhoto } from '~/data/clinic'

const props = defineProps<{ photos: readonly ClinicPhoto[] }>()

const slots = computed(() => props.photos.slice(0, 6))
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
    <figure v-for="(photo, i) in slots" :key="i" v-reveal="i" class="m-item" :class="`m-${i}`">
      <component
        :is="photo.src ? 'button' : 'div'"
        :type="photo.src ? 'button' : undefined"
        class="m-frame"
        :aria-label="photo.src ? `Ampliar: ${resolveValue(photo.alt)}` : undefined"
        @click="openAt(photo, $event)"
      >
        <img
          v-if="photo.src"
          :src="publicUrl(photo.src)"
          :alt="resolveValue(photo.alt)"
          :loading="i === 0 ? undefined : 'lazy'"
          class="m-img"
        />
        <PhotoPlaceholder v-else ratio="1 / 1" class="m-img" />
      </component>
      <figcaption class="m-caption"><ContentValue :value="photo.caption" /></figcaption>
    </figure>

    <dialog
      ref="dialog"
      class="lightbox"
      aria-label="Galería de la clínica"
      @keydown="onKey"
      @close="onClose"
      @click.self="close"
    >
      <div v-if="viewable.length" class="lb-inner" @touchstart.passive="onTouchStart" @touchend="onTouchEnd">
        <img
          :src="publicUrl(viewable[current]!.src!)"
          :alt="resolveValue(viewable[current]!.alt)"
          class="lb-img"
        />
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem 1rem;
  align-items: start;
}
.m-frame {
  position: relative;
  display: block;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-l);
  background: var(--color-ink);
}
button.m-frame {
  cursor: zoom-in;
}
.m-frame .m-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 900ms var(--ease-out-soft);
}
img.m-img {
  display: block;
}
@media (hover: hover) and (pointer: fine) {
  button.m-frame:hover .m-img {
    transform: scale(1.04);
  }
}
.m-caption {
  margin-top: 0.6rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* Proporciones y posiciones: móvil en 2 columnas */
.m-0 {
  grid-column: 1 / -1;
}
.m-0 .m-frame {
  aspect-ratio: 3 / 2;
}
.m-1 .m-frame {
  aspect-ratio: 4 / 5;
}
.m-2 .m-frame {
  aspect-ratio: 4 / 5;
}
.m-3 {
  grid-column: 1 / -1;
}
.m-3 .m-frame {
  aspect-ratio: 16 / 9;
}
.m-4 .m-frame {
  aspect-ratio: 4 / 5;
}
.m-5 .m-frame {
  aspect-ratio: 4 / 5;
}

@media (min-width: 768px) {
  .mosaic {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 1.5rem;
  }
  .m-0 {
    grid-column: 1 / span 7;
    grid-row: 1;
  }
  .m-1 {
    grid-column: 9 / span 3;
    grid-row: 1;
    margin-top: clamp(2rem, 5vw, 5rem);
  }
  .m-2 {
    grid-column: 2 / span 3;
    grid-row: 2;
    margin-top: clamp(0rem, 1vw, 1rem);
  }
  .m-2 .m-frame {
    aspect-ratio: 1 / 1;
  }
  .m-3 {
    grid-column: 6 / span 6;
    grid-row: 2;
    margin-top: clamp(1rem, 3vw, 3rem);
  }
  .m-4 {
    grid-column: 1 / span 4;
    grid-row: 3;
    margin-top: clamp(1rem, 2vw, 2rem);
  }
  .m-4 .m-frame {
    aspect-ratio: 4 / 3;
  }
  .m-5 {
    grid-column: 6 / span 3;
    grid-row: 3;
    margin-top: clamp(2rem, 5vw, 5rem);
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
