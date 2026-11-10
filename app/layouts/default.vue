<script setup lang="ts">
/**
 * Layout base (spec 02). La navbar es fija: `main` deja su altura arriba y las páginas con hero a sangre la
 * recuperan con `.under-navbar` (el hero queda debajo de la navbar transparente).
 * `data-page-root` marca lo que se vuelve `inert` mientras el menú móvil está abierto.
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

    <SiteFooter />
  </div>
</template>
