<script setup lang="ts">
/**
 * Cabecera común de las páginas interiores: etiqueta con índice, titular monumental y, desplazada a la
 * derecha, la entradilla y las acciones. Mismo molde en todas las páginas para que se lean como una sola
 * marca; lo que cambia es el color del capítulo (`tone`) y el tamaño del titular (`size`).
 */
defineProps<{
  title: string
  eyebrow?: string
  /** Capítulo de color de la cabecera. */
  tone?: 'bone' | 'bone-2' | 'ink' | 'blue'
  size?: 'xl' | 'mega'
  crumbs?: readonly { name: string; to?: string }[]
  id?: string
}>()
defineSlots<{ default?: () => unknown; actions?: () => unknown }>()
</script>

<template>
  <header
    class="page-header section-clip"
    :class="`chapter-${tone ?? 'bone'}`"
    :data-nav-theme="tone === 'ink' ? 'ink' : tone === 'blue' ? 'blue' : 'bone'"
  >
    <div class="container-wide">
      <SiteBreadcrumbs v-if="crumbs" :items="crumbs" class="page-header__crumbs" />

      <div class="page-header__grid">
        <p v-if="eyebrow" v-reveal class="eyebrow page-header__eyebrow">{{ eyebrow }}</p>
        <h1
          :id="id ?? 'page-title'"
          v-reveal
          class="page-header__title"
          :class="size === 'mega' ? 'mega' : 'text-display-xl'"
        >
          {{ title }}
        </h1>
        <div v-if="$slots.default || $slots.actions" class="page-header__side">
          <div v-if="$slots.default" v-reveal="1" class="page-header__lede text-body-l">
            <slot />
          </div>
          <div v-if="$slots.actions" v-reveal="2" class="page-header__actions">
            <slot name="actions" />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  padding-block: clamp(2rem, 5vw, 4.5rem) clamp(3rem, 7vw, 7rem);
}
.page-header__crumbs {
  margin-bottom: clamp(2rem, 5vw, 4rem);
}
.page-header__grid {
  display: grid;
  gap: 1.5rem;
}
.page-header__eyebrow {
  opacity: 0.75;
}
.page-header__title {
  font-size: var(--text-display-xl);
  line-height: 0.9;
  max-width: 14ch;
}
.page-header__title.mega {
  max-width: none;
  font-size: min(var(--text-mega), 22vw);
}
.page-header__side {
  display: grid;
  gap: 1.5rem;
  margin-top: clamp(0.5rem, 3vw, 2.5rem);
}
.page-header__lede {
  max-width: 44ch;
  color: var(--color-text-secondary);
}
.page-header__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.5rem;
}

@media (min-width: 1024px) {
  .page-header__grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
    row-gap: 2rem;
  }
  .page-header__eyebrow {
    grid-column: 1 / span 3;
    padding-top: 1.4rem;
  }
  .page-header__title {
    grid-column: 4 / -1;
    max-width: 16ch;
  }
  .page-header__title.mega {
    grid-column: 1 / -1;
  }
  .page-header__side {
    grid-column: 8 / span 5;
    margin-top: 0;
  }
}
</style>
