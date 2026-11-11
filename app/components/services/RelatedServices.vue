<script setup lang="ts">
/** "También te puede interesar" (spec 04): enlazado interno entre servicios con las mismas piezas fotográficas. */
import { getService } from '~/data/services'

const props = defineProps<{ slugs: readonly string[] }>()
const items = computed(() => props.slugs.map(getService))
</script>

<template>
  <section
    class="chapter-ink section-clip py-(--space-section)"
    data-nav-theme="ink"
    aria-labelledby="related-title"
  >
    <div class="container-wide">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <h2 id="related-title" v-reveal class="max-w-[14ch] text-display-l text-bone">Sigue el camino.</h2>
        <NuxtLink to="/servicios" class="related-all eyebrow">Todos los servicios</NuxtLink>
      </div>
      <ul class="mt-10 grid gap-4 md:grid-cols-2" role="list">
        <li v-for="(service, i) in items" :key="service.slug" v-reveal="i" class="related-item">
          <ServiceTile :service="service" size="l" sizes="(min-width: 768px) 50vw, 100vw" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.related-item {
  aspect-ratio: 4 / 3;
}
.related-all {
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 6px;
  transition: text-decoration-color var(--dur-base) var(--ease-out-soft);
}
.related-all:hover {
  text-decoration-color: currentColor;
}
</style>
