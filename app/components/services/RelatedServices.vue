<script setup lang="ts">
/** "También te puede interesar" (spec 04): enlazado interno entre servicios relacionados. */
import { getService, servicePath } from '~/data/services'

const props = defineProps<{ slugs: readonly string[] }>()
const items = computed(() => props.slugs.map(getService))
</script>

<template>
  <section class="container-site py-(--space-section)" aria-labelledby="related-title">
    <h2 id="related-title" v-reveal class="font-display text-display-m text-deep-blue">
      También te puede <em class="text-primary">interesar</em>.
    </h2>
    <ul class="mt-10 grid gap-4 md:grid-cols-2" role="list">
      <li v-for="(service, i) in items" :key="service.slug" v-reveal="i">
        <NuxtLink :to="servicePath(service.slug)" class="related-card">
          <span class="related-graphic" aria-hidden="true">
            <ServiceGraphic :kind="service.graphic" :active="false" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="font-display text-heading-s text-primary">{{ service.number }}</span>
            <span class="mt-1 block text-heading-s font-semibold text-deep-blue">{{ service.name }}</span>
            <ContentValue :value="service.summary" class="mt-1 block text-sm text-text-secondary" />
          </span>
          <BaseIcon name="arrow-right" class="related-arrow size-5 text-primary" />
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.related-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  height: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-m);
  background: var(--color-white);
  padding: 1.25rem;
  transition:
    border-color var(--dur-base) var(--ease-out-soft),
    box-shadow var(--dur-base) var(--ease-out-soft);
}
.related-graphic {
  flex: none;
  width: 72px;
  height: 64px;
}
.related-arrow {
  transition: transform var(--dur-base) var(--ease-out-soft);
}
@media (max-width: 480px) {
  .related-graphic {
    display: none;
  }
}
@media (hover: hover) and (pointer: fine) {
  .related-card:hover {
    border-color: rgb(18 112 182 / 0.4);
    box-shadow: var(--shadow-soft);
  }
  .related-card:hover .related-arrow {
    transform: translateX(4px);
  }
}
</style>
