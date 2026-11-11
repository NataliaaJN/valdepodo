<script setup lang="ts">
/** Migas de pan visibles (spec 10 §3: breadcrumbs en servicios). El schema lo pone `useServicePage`. */
defineProps<{ items: readonly { name: string; to?: string }[] }>()
</script>

<template>
  <nav aria-label="Migas de pan" class="crumbs">
    <ol class="flex flex-wrap items-center gap-x-2 gap-y-1">
      <li v-for="(item, i) in items" :key="item.name" class="flex items-center gap-2">
        <NuxtLink v-if="item.to && i < items.length - 1" :to="item.to" class="crumb-link">{{
          item.name
        }}</NuxtLink>
        <span v-else aria-current="page" class="font-medium">{{ item.name }}</span>
        <span v-if="i < items.length - 1" aria-hidden="true" class="opacity-50">/</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.crumbs {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}
.crumb-link {
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 4px;
  transition: text-decoration-color var(--dur-base) var(--ease-out-soft);
}
.crumb-link:hover {
  text-decoration-color: currentColor;
}
</style>
