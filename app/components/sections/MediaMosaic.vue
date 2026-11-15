<script setup lang="ts">
/**
 * Composición editorial del espacio de la clínica (spec 05 §3), pensada para 1 a 6 fotografías: se pintan solo
 * las que ya existen (nunca marcos vacíos) y la rejilla se recompone según cuántas hay (`mosaic--n{N}`):
 * una principal grande y las demás repartidas a su lado y debajo. Sin pies de foto.
 * Móvil: principal a ancho completo y el resto de dos en dos.
 * Lightbox accesible con <dialog> nativo: flechas y teclado, Esc, foco atrapado (lo hace el navegador con
 * showModal), contador "2 / 4" y deslizar en táctil.
 */
import { resolveValue } from '#shared/utils/pending'
import type { ClinicPhoto } from '~/data/clinic'

const props = defineProps<{ photos: readonly ClinicPhoto[] }>()

const viewable = computed(() => props.photos.filter((p) => p.src).slice(0, 6))

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
  <div v-if="viewable.length" class="mosaic" :class="`mosaic--n${viewable.length}`">
    <div v-for="(photo, i) in viewable" :key="photo.src!" v-reveal="i" class="m-item" :class="`m-${i}`">
      <button
        type="button"
        class="m-frame"
        :aria-label="`Ampliar: ${resolveValue(photo.alt)}`"
        @click="openAt(photo, $event)"
      >
        <img
          :src="photo.src!"
          :alt="resolveValue(photo.alt)"
          :loading="i === 0 ? undefined : 'lazy'"
          class="m-img"
        />
      </button>
    </div>

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
  --row: clamp(11rem, 18vw, 17rem);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: var(--row);
  gap: 0.75rem;
}
.m-item {
  min-width: 0;
  min-height: 0;
}
.m-frame {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: var(--radius-m);
  background: var(--color-ink);
  cursor: zoom-in;
  transform: translateZ(0);
}
.m-frame .m-img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: scale var(--dur-image) var(--ease-out-soft);
}
@media (hover: hover) and (pointer: fine) {
  .m-frame:hover .m-img {
    scale: 1.03;
  }
}
@media (prefers-reduced-motion: reduce) {
  .m-frame:hover .m-img {
    scale: 1;
  }
}

/* Móvil: la principal a todo el ancho y doble de alta; el resto de dos en dos */
.m-0 {
  grid-column: 1 / -1;
  grid-row: span 2;
}
/* Con un número impar de fotos pequeñas, la última va a ancho completo */
.mosaic--n2 .m-1,
.mosaic--n4 .m-3,
.mosaic--n6 .m-5 {
  grid-column: 1 / -1;
}

@media (min-width: 768px) {
  .mosaic {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 1rem;
  }
  .mosaic .m-item {
    grid-column: span 3;
    grid-row: span 1;
  }
  /* 1 foto: panorámica */
  .mosaic--n1 .m-0 {
    grid-column: 1 / -1;
    grid-row: span 2;
  }
  /* 2 fotos: 7 + 5 */
  .mosaic--n2 .m-0 {
    grid-column: span 7;
    grid-row: span 2;
  }
  .mosaic--n2 .m-1 {
    grid-column: span 5;
    grid-row: span 2;
  }
  /* 3 fotos: grande a la izquierda y dos apiladas */
  .mosaic--n3 .m-0 {
    grid-column: span 7;
    grid-row: span 2;
  }
  .mosaic--n3 .m-1,
  .mosaic--n3 .m-2 {
    grid-column: span 5;
  }
  /* 4 fotos: grande, una ancha arriba y dos pequeñas debajo */
  .mosaic--n4 .m-0 {
    grid-column: span 6;
    grid-row: span 2;
  }
  .mosaic--n4 .m-1 {
    grid-column: span 6;
  }
  .mosaic--n4 .m-2,
  .mosaic--n4 .m-3 {
    grid-column: span 3;
  }
  /* 5 y 6 fotos: grande y cuadrícula de pequeñas; la sexta, panorámica abajo */
  .mosaic--n5 .m-0,
  .mosaic--n6 .m-0 {
    grid-column: span 6;
    grid-row: span 2;
  }
  .mosaic--n5 .m-1,
  .mosaic--n5 .m-2,
  .mosaic--n5 .m-3,
  .mosaic--n5 .m-4,
  .mosaic--n6 .m-1,
  .mosaic--n6 .m-2,
  .mosaic--n6 .m-3,
  .mosaic--n6 .m-4 {
    grid-column: span 3;
  }
  .mosaic--n6 .m-5 {
    grid-column: 1 / -1;
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
