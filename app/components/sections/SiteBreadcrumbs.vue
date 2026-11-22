<script setup lang="ts">
/**
 * Migas de pan visibles (spec 10 §3: breadcrumbs en servicios). El schema lo pone `useServicePage`.
 * Una sola cápsula: casa para «Inicio», chevrones finos como separador y la página actual como chip
 * relleno (el único punto de peso). `light` = sobre fotografía/vídeo (cristal esmerilado + hueso).
 */
defineProps<{ items: readonly { name: string; to?: string }[]; light?: boolean }>()
</script>

<template>
  <nav aria-label="Migas de pan" class="crumbs" :class="{ 'crumbs--light': light }">
    <ol class="crumbs__list">
      <li v-for="(item, i) in items" :key="item.name" class="crumbs__item">
        <NuxtLink
          v-if="item.to && i < items.length - 1"
          :to="item.to"
          class="crumbs__link"
          :class="{ 'crumbs__link--home': i === 0 }"
          :aria-label="i === 0 ? item.name : undefined"
        >
          <svg
            v-if="i === 0"
            class="crumbs__home"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M3.5 9.2 10 3.5l6.5 5.7" />
            <path d="M5 8.4V16h3.6v-4.2h2.8V16H15V8.4" />
          </svg>
          <span v-else>{{ item.name }}</span>
        </NuxtLink>
        <span v-else aria-current="page" class="crumbs__current">{{ item.name }}</span>
        <svg
          v-if="i < items.length - 1"
          class="crumbs__sep"
          viewBox="0 0 8 12"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m1.5 1.5 5 4.5-5 4.5" />
        </svg>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.crumbs {
  --crumb-fg: var(--color-text-secondary);
  --crumb-hover-bg: rgb(6 26 44 / 0.07);
  --crumb-chip-bg: var(--color-ink);
  --crumb-chip-fg: var(--color-bone);
  font-size: 0.875rem;
  line-height: 1;
  color: var(--crumb-fg);
}
.crumbs--light {
  --crumb-fg: rgb(241 239 233 / 0.88);
  --crumb-hover-bg: rgb(241 239 233 / 0.16);
  --crumb-chip-bg: var(--color-bone);
  --crumb-chip-fg: var(--color-ink);
}
.crumbs__list {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-width: 0;
  padding: 0.25rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: rgb(255 255 255 / 0.4);
}
.crumbs--light .crumbs__list {
  border-color: rgb(241 239 233 / 0.28);
  background: rgb(6 26 44 / 0.34);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  backdrop-filter: blur(14px) saturate(1.2);
}
.crumbs__item {
  display: flex;
  align-items: center;
  min-width: 0;
}
.crumbs__link,
.crumbs__current {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  padding-inline: 0.75rem;
  border-radius: 999px;
  white-space: nowrap;
}
.crumbs__link {
  color: var(--crumb-fg);
  transition:
    background-color var(--dur-fast) var(--ease-out-soft),
    color var(--dur-fast) var(--ease-out-soft);
}
.crumbs__link--home {
  padding-inline: 0.6rem;
}
.crumbs__link:hover {
  background: var(--crumb-hover-bg);
  color: inherit;
}
.crumbs--light .crumbs__link:hover {
  color: var(--color-bone);
}
.crumbs__home {
  width: 1.05rem;
  height: 1.05rem;
}
.crumbs__sep {
  flex: none;
  width: 0.45rem;
  height: 0.7rem;
  /* El chip activo es una forma rellena: necesita más aire a su lado que un enlace de texto */
  margin-inline: 0.1rem;
  opacity: 0.55;
}
/* Solo el separador que antecede al chip activo: el borde del chip debe quedar a la misma
   distancia de la flecha que el texto del enlace anterior. */
.crumbs__item:has(+ .crumbs__item > .crumbs__current) .crumbs__sep {
  margin-inline-end: 0.85rem;
}
.crumbs__current {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  line-height: 2rem;
  font-weight: 600;
  background: var(--crumb-chip-bg);
  color: var(--crumb-chip-fg);
}
</style>
