<script setup lang="ts">
/** Redes sociales como iconos circulares de 44 px, sobre fondo tinta (footer y menú móvil). */
const clinic = useClinic()
const links = [
  { icon: 'instagram', label: 'Instagram', url: clinic.instagram.url },
  { icon: 'linkedin', label: 'LinkedIn', url: clinic.linkedin.url },
] as const
</script>

<template>
  <ul class="social" role="list">
    <li v-for="link in links" :key="link.icon">
      <a :href="link.url" class="social__link" target="_blank" rel="noopener">
        <BaseIcon :name="link.icon" />
        <span class="sr-only">{{ link.label }} (se abre en una pestaña nueva)</span>
      </a>
    </li>
  </ul>
</template>

<style scoped>
.social {
  display: flex;
  gap: 0.5rem;
}
.social__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid rgb(241 239 233 / 0.3);
  border-radius: 9999px;
  color: var(--color-bone);
  transition:
    background-color var(--dur-fast) var(--ease-out-soft),
    border-color var(--dur-fast) var(--ease-out-soft),
    color var(--dur-fast) var(--ease-out-soft);
}
.social__link :deep(.base-icon) {
  width: 1.3rem;
  height: 1.3rem;
}
@media (hover: hover) and (pointer: fine) {
  .social__link:hover {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-ink);
  }
}
</style>
