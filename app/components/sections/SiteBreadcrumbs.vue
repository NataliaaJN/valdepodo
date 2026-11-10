<script setup lang="ts">
/** Migas de pan visibles (spec 10 §3: breadcrumbs en servicios). El schema lo pone `useServicePage`. */
defineProps<{ items: readonly { name: string; to?: string }[] }>()
</script>

<template>
  <nav aria-label="Migas de pan" class="text-sm text-text-secondary">
    <ol class="flex flex-wrap items-center gap-x-2 gap-y-1">
      <li v-for="(item, i) in items" :key="item.name" class="flex items-center gap-2">
        <NuxtLink
          v-if="item.to && i < items.length - 1"
          :to="item.to"
          class="underline decoration-transparent underline-offset-4 transition-colors hover:text-primary-strong hover:decoration-current"
          >{{ item.name }}</NuxtLink
        >
        <span v-else aria-current="page" class="font-semibold text-deep-blue">{{ item.name }}</span>
        <span v-if="i < items.length - 1" aria-hidden="true" class="text-border-strong">/</span>
      </li>
    </ol>
  </nav>
</template>
