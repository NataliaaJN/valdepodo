<script setup lang="ts">
useHead({
  titleTemplate: (title) => (title ? `${title} · Valdepodo` : 'Valdepodo · Clínica de podología'),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ProposalToolbar />
</template>
