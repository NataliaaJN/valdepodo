<script setup lang="ts">
/**
 * Footer global. Una sola fila de datos (ubicación · contacto · redes) y la línea legal.
 * Todos los datos salen de `app/data/site.ts`.
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
          <ContentValue
            :value="site.tagline"
            as="p"
            class="mt-6 font-display text-[length:clamp(1.5rem,1.1rem+1.5vw,2.25rem)] leading-[1.05] text-bone"
          />
        </div>

        <address class="footer-col not-italic">
          <p class="footer-title">Ubicación</p>
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
          <p class="footer-title">Contacto</p>
          <a :href="clinic.phoneHref" class="footer-link"><ContentValue :value="site.phone" /></a>
          <a :href="clinic.mailHref" class="footer-link break-all"><ContentValue :value="site.email" /></a>
        </div>

        <div class="footer-col">
          <p class="footer-title">Síguenos</p>
          <ul class="footer-social" role="list">
            <li>
              <a :href="clinic.instagram.url" class="footer-social__link" target="_blank" rel="noopener">
                <BaseIcon name="instagram" />
                <span class="sr-only">Instagram (se abre en una pestaña nueva)</span>
              </a>
            </li>
            <li>
              <a :href="clinic.linkedin.url" class="footer-social__link" target="_blank" rel="noopener">
                <BaseIcon name="linkedin" />
                <span class="sr-only">LinkedIn (se abre en una pestaña nueva)</span>
              </a>
            </li>
          </ul>
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

.footer-social {
  display: flex;
  gap: 0.5rem;
}
.footer-social__link {
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
.footer-social__link :deep(.base-icon) {
  width: 1.3rem;
  height: 1.3rem;
}
.footer-social__link:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-ink);
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
</style>
