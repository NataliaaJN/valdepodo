<script setup lang="ts">
/**
 * Footer global. Una sola fila de datos (ubicación · contacto · redes), la línea legal y VALDEPODO a ancho
 * completo, recortado por abajo, como elemento gráfico de cierre. Todos los datos salen de `app/data/site.ts`.
 */
import { site } from '~/data/site'

const clinic = useClinic()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer chapter-ink section-clip relative" data-nav-theme="ink" data-page-root>
    <div class="container-wide pt-20 lg:pt-28">
      <div class="footer-row">
        <div class="footer-lead">
          <NuxtLink to="/" class="inline-flex items-center gap-3" aria-label="Valdepodo, inicio">
            <BrandLogo variant="symbol" mono label="" class="w-[20px]" />
            <BrandLogo variant="wordmark" mono label="" class="w-[108px]" />
          </NuxtLink>
          <ContentValue :value="site.tagline" as="p" class="mt-6 font-display text-display-m text-bone" />
        </div>

        <address class="footer-col not-italic">
          <h2 class="footer-title">Ubicación</h2>
          <p>
            <ContentValue :value="site.address.street" /><br />
            <ContentValue :value="site.address.postalCode" />{{ ' ' }}
            <ContentValue :value="site.address.locality" />
          </p>
          <a :href="clinic.directions" class="footer-link" target="_blank" rel="noopener">
            Cómo llegar<span class="sr-only"> (se abre en Google Maps)</span>
          </a>
        </address>

        <div class="footer-col">
          <h2 class="footer-title">Contacto</h2>
          <a :href="clinic.phoneHref" class="footer-link"><ContentValue :value="site.phone" /></a>
          <a :href="clinic.mailHref" class="footer-link break-all"><ContentValue :value="site.email" /></a>
        </div>

        <div class="footer-col">
          <h2 class="footer-title">Redes</h2>
          <a :href="clinic.instagram.url" class="footer-link" target="_blank" rel="noopener">
            <ContentValue v-slot="{ value }" :value="site.instagram">{{ value.handle }}</ContentValue>
            <span class="sr-only">(Instagram, se abre en una pestaña nueva)</span>
          </a>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© {{ year }} {{ site.name }}</p>
        <nav aria-label="Legal">
          <ul class="flex flex-wrap gap-x-6 gap-y-2" role="list">
            <li v-for="item in site.legalNav" :key="item.to">
              <NuxtLink :to="item.to" class="footer-link">{{ item.label }}</NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- VALDEPODO a ancho completo: el SVG escala con el viewport; el recorte inferior lo hace gráfico -->
    <div class="footer-word" aria-hidden="true">
      <svg viewBox="0 0 1000 250" preserveAspectRatio="xMidYMax meet">
        <text x="0" y="238" textLength="1000" lengthAdjust="spacingAndGlyphs">VALDEPODO</text>
      </svg>
    </div>
  </footer>
</template>

<style scoped>
.footer-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2.5rem;
}
@media (min-width: 640px) {
  .footer-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .footer-lead {
    grid-column: 1 / -1;
  }
}
@media (min-width: 1024px) {
  .footer-row {
    grid-template-columns: minmax(0, 5fr) repeat(3, minmax(0, 2fr));
    column-gap: 2rem;
  }
  .footer-lead {
    grid-column: auto;
  }
}

.footer-col {
  display: grid;
  align-content: start;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: var(--color-ice-blue);
}
.footer-title {
  margin-bottom: 0.5rem;
  font-family: var(--font-sans);
  font-size: var(--text-eyebrow);
  font-weight: 500;
  letter-spacing: var(--text-eyebrow--letter-spacing);
  text-transform: uppercase;
  color: rgb(241 239 233 / 0.6);
}
.footer-link {
  width: fit-content;
  color: var(--color-bone);
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 5px;
  transition: text-decoration-color var(--dur-base) var(--ease-out-soft);
}
.footer-link:hover {
  text-decoration-color: currentColor;
}

.footer-bottom {
  margin-top: clamp(4rem, 8vw, 7rem);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem 2rem;
  border-top: 1px solid var(--color-border);
  padding-block: 1.25rem;
  font-size: 0.875rem;
  color: rgb(241 239 233 / 0.7);
}

.footer-word {
  /* Recorta el 14 % inferior del rótulo */
  overflow: hidden;
  padding-inline: var(--gutter);
  margin-bottom: -0.5vw;
  line-height: 0;
}
.footer-word svg {
  display: block;
  width: 100%;
  height: auto;
  margin-bottom: -2.4vw;
}
.footer-word text {
  font-family: var(--font-display);
  font-weight: 650;
  font-size: 255px;
  letter-spacing: -0.02em;
  font-stretch: 75%;
  fill: var(--color-primary);
}
</style>
