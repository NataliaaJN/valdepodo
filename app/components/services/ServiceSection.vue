<script setup lang="ts">
/**
 * Sección estándar de las páginas de servicio. Toda sección usa la misma disposición:
 *   h2 (y entradilla opcional) en la columna izquierda · contenido en la derecha (escritorio, 4 + 8 columnas);
 *   título arriba y contenido debajo en tablet y móvil.
 * Mismo ancho (`container-wide`), mismo margen vertical y dos fondos de papel que se alternan (`bone`, `bone-2`).
 * El título siempre es una frase nominal en texto plano (sin palabra acentuada).
 */
import type { Maybe } from '#shared/utils/pending'

withDefaults(
  defineProps<{
    id: string
    title: string
    intro?: Maybe<string>
    tone?: 'bone' | 'bone-2'
  }>(),
  { intro: undefined, tone: 'bone' },
)
defineSlots<{ default?: () => unknown; rail?: () => unknown }>()
</script>

<template>
  <section
    class="svc-section section-clip"
    :class="tone === 'bone' ? 'chapter-bone' : 'chapter-bone-2'"
    :aria-labelledby="id"
    data-nav-theme="bone"
  >
    <div class="container-wide svc-section__grid">
      <div class="svc-section__rail">
        <h2 :id="id" v-reveal class="svc-section__title">{{ title }}</h2>
        <ContentValue v-if="intro" v-reveal="1" :value="intro" as="p" class="svc-section__intro" />
        <slot name="rail" />
      </div>
      <div class="svc-section__body">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.svc-section {
  padding-block: clamp(3.5rem, 6vw, 5.5rem);
}
.svc-section__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(1.5rem, 4vw, 3rem);
}
.svc-section__title {
  max-width: 14ch;
  font-size: var(--text-display-m);
  line-height: var(--text-display-m--line-height);
  color: var(--color-ink);
}
.svc-section__intro {
  max-width: 34ch;
  margin-top: 1.25rem;
  font-size: var(--text-body-l);
  line-height: var(--text-body-l--line-height);
  color: var(--color-text-secondary);
}
.svc-section__body {
  min-width: 0;
}
@media (min-width: 1024px) {
  .svc-section__grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
    align-items: start;
  }
  .svc-section__rail {
    grid-column: 1 / span 4;
  }
  .svc-section__body {
    grid-column: 5 / span 8;
  }
}
</style>
