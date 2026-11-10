<script setup lang="ts">
/**
 * Layout base provisional (Fase 1). La navbar y el footer definitivos se desarrollan en la Fase 6.1 (spec 02).
 */
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <a
      href="#contenido"
      class="sr-only z-50 rounded-pill bg-white px-5 py-3 font-semibold text-deep-blue focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
    >
      Saltar al contenido
    </a>

    <header class="border-b border-border/70 bg-surface/85 backdrop-blur">
      <div class="container-site flex h-[68px] items-center justify-between gap-6">
        <NuxtLink to="/" class="block w-[132px]" aria-label="Valdepodo, inicio">
          <BrandLogo variant="wordmark" label="" />
        </NuxtLink>
        <BaseButton size="sm" to="/" arrow>Pedir cita</BaseButton>
      </div>
    </header>

    <main id="contenido" class="flex-1" tabindex="-1">
      <slot />
    </main>

    <footer class="bg-deep-blue py-10 text-ice-blue">
      <div class="container-site flex flex-wrap items-center justify-between gap-4 text-sm">
        <BrandLogo variant="wordmark" mono label="" class="w-[120px] text-white" />
        <p>Versión en desarrollo · Fase 1</p>
      </div>
    </footer>
  </div>
</template>
