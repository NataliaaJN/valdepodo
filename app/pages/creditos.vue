<script setup lang="ts">
/** Créditos y licencias (plan Fase 6.7, spec 10 §7). */
import { assetCredits, fontCredits, softwareCredits, type Credit } from '~/data/credits'

usePageSeo({
  title: 'Créditos',
  description: 'Recursos de terceros usados en la web de Valdepodo y sus licencias.',
  path: '/creditos',
})

const groups: { title: string; items: readonly Credit[] }[] = [
  { title: 'Modelos 3D', items: assetCredits },
  { title: 'Tipografías', items: fontCredits },
  { title: 'Software', items: softwareCredits },
]
</script>

<template>
  <article class="container-site py-12 lg:py-20" aria-labelledby="credits-title">
    <p class="eyebrow text-primary-strong">Legal</p>
    <h1 id="credits-title" class="mt-4 font-display text-display-l text-deep-blue">Créditos</h1>
    <p class="measure mt-6 text-body-l text-text-secondary">
      Las ilustraciones, los recursos gráficos (huellas, mapas de presión, líneas) y la plantilla 3D son
      propios de este proyecto. Estos son los recursos de terceros que usa la web y sus licencias.
    </p>

    <section
      v-for="group in groups"
      :key="group.title"
      class="mt-12"
      :aria-labelledby="`credits-${group.title}`"
    >
      <h2 :id="`credits-${group.title}`" class="font-display text-display-m text-deep-blue">
        {{ group.title }}
      </h2>
      <ul class="mt-6 border-t border-border" role="list">
        <li v-for="c in group.items" :key="c.name" class="credit-row">
          <div>
            <a
              :href="c.url"
              target="_blank"
              rel="noopener"
              class="font-semibold text-deep-blue underline underline-offset-4"
            >
              {{ c.name }}<span class="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
            <p class="mt-1 text-sm text-text-secondary">{{ c.use }}</p>
          </div>
          <p class="text-sm text-text-secondary">{{ c.author }}</p>
          <p class="text-sm font-semibold text-primary-strong">{{ c.license }}</p>
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.credit-row {
  display: grid;
  gap: 0.25rem 2rem;
  border-bottom: 1px solid var(--color-border);
  padding-block: 1rem;
}
@media (min-width: 768px) {
  .credit-row {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
  }
}
</style>
