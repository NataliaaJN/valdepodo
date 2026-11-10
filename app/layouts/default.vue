<script setup lang="ts">
/**
 * Layout base. Navbar de la propuesta visual (Fase 5, spec 02 §2); el footer definitivo llega en la Fase 6.1.
 * La navbar es fija: `main` deja su altura arriba y las páginas con hero a sangre la recuperan con
 * `.under-navbar` (el hero queda debajo de la navbar transparente).
 */
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <a
      href="#contenido"
      class="sr-only z-50 rounded-pill bg-white px-5 py-3 font-semibold text-deep-blue focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      data-page-root
    >
      Saltar al contenido
    </a>

    <SiteNavbar />

    <main id="contenido" class="flex-1 pt-(--nav-h)" tabindex="-1" data-page-root>
      <slot />
    </main>

    <footer class="bg-deep-blue py-10 text-ice-blue" data-page-root>
      <div class="container-site flex flex-wrap items-center justify-between gap-4 text-sm">
        <BrandLogo variant="wordmark" mono label="" class="w-[120px] text-white" />
        <p>Versión en desarrollo · propuesta visual (Fase 5)</p>
      </div>
    </footer>
  </div>
</template>
