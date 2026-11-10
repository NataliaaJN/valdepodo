<script setup lang="ts">
/**
 * Footer global (spec 02 §3). Fondo deep-blue (única gran superficie oscura) con huellas cian a baja
 * opacidad. Columnas: escritorio 4 · tablet 2 · móvil 1, todo visible (sin acordeón).
 * Todos los datos salen de `app/data/site.ts`.
 */
import { site } from '~/data/site'
import { servicePath, services } from '~/data/services'

const clinic = useClinic()
const year = new Date().getFullYear()

const trail = [
  { x: 8, y: 70, r: 12, side: 'left' },
  { x: 15, y: 48, r: 18, side: 'right' },
  { x: 24, y: 30, r: 26, side: 'left' },
  { x: 35, y: 16, r: 34, side: 'right' },
] as const
</script>

<template>
  <footer class="site-footer section-clip relative isolate text-ice-blue" data-page-root>
    <svg class="footer-trail" viewBox="0 0 100 100" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
      <g
        v-for="(s, i) in trail"
        :key="i"
        :transform="`translate(${s.x + 50} ${s.y}) rotate(${s.r}) scale(0.075)`"
        :style="{ opacity: 0.06 + i * 0.03 }"
      >
        <Footprint :side="s.side" variant="fill" />
      </g>
    </svg>

    <div class="container-site relative pt-20 pb-8 lg:pt-24">
      <div class="footer-grid">
        <div class="footer-brand">
          <NuxtLink to="/" class="inline-flex items-center gap-3" aria-label="Valdepodo, inicio">
            <BrandLogo variant="symbol" mono label="" class="w-[26px] text-cyan" />
            <BrandLogo variant="wordmark" mono label="" class="w-[132px] text-white" />
          </NuxtLink>
          <ContentValue
            :value="site.tagline"
            as="p"
            class="mt-6 font-display text-heading-s text-white italic sm:text-[1.75rem]"
          />
          <p class="mt-3 max-w-[28ch] text-sm">
            <ContentValue :value="site.foundedYear">{{ clinic.years }}</ContentValue>
            años cuidando de la salud de tus pies.
          </p>
        </div>

        <nav aria-labelledby="footer-nav-title">
          <h2 id="footer-nav-title" class="footer-title">Navegación</h2>
          <ul class="footer-list" role="list">
            <li v-for="item in site.footerNav" :key="item.to">
              <NuxtLink :to="item.to" class="footer-link">{{ item.label }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-services-title">
          <h2 id="footer-services-title" class="footer-title">Servicios</h2>
          <ul class="footer-list" role="list">
            <li v-for="service in services" :key="service.slug">
              <NuxtLink :to="servicePath(service.slug)" class="footer-link">{{ service.name }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <div>
          <h2 class="footer-title">Contacto</h2>
          <address class="footer-list not-italic">
            <span class="flex gap-3">
              <BaseIcon name="map-pin" class="mt-0.5 text-cyan" />
              <span>
                <ContentValue :value="site.address.street" /><br />
                <ContentValue :value="site.address.postalCode" />{{ ' ' }}
                <ContentValue :value="site.address.locality" />
              </span>
            </span>
            <a :href="clinic.phoneHref" class="footer-link flex gap-3">
              <BaseIcon name="phone" class="mt-0.5 text-cyan" />
              <ContentValue :value="site.phone" />
            </a>
            <a :href="clinic.mailHref" class="footer-link flex gap-3 break-all">
              <BaseIcon name="mail" class="mt-0.5 text-cyan" />
              <ContentValue :value="site.email" />
            </a>
            <a :href="clinic.instagram.url" class="footer-link flex gap-3" target="_blank" rel="noopener">
              <BaseIcon name="instagram" class="mt-0.5 text-cyan" />
              <ContentValue v-slot="{ value }" :value="site.instagram">{{ value.handle }}</ContentValue>
              <span class="sr-only">(Instagram, se abre en una pestaña nueva)</span>
            </a>
          </address>
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
.site-footer {
  background:
    radial-gradient(50% 60% at 100% 0%, rgb(30 171 225 / 0.16), transparent 70%), var(--color-deep-blue);
  --fp-fill: var(--color-cyan);
}
.footer-trail {
  position: absolute;
  right: 0;
  bottom: 0;
  width: min(70vw, 640px);
  height: 100%;
  pointer-events: none;
}

.footer-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 3rem 2rem;
}
@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .footer-grid {
    grid-template-columns: minmax(0, 1.4fr) repeat(2, minmax(0, 1fr)) minmax(0, 1.3fr);
  }
}

.footer-title {
  font-size: var(--text-eyebrow);
  letter-spacing: var(--text-eyebrow--letter-spacing);
  text-transform: uppercase;
  font-weight: 600;
  /* El cian sobre deep-blue da 4,3:1: no basta para texto pequeño */
  color: var(--color-white);
  opacity: 0.72;
}
.footer-list {
  margin-top: 1.25rem;
  display: grid;
  gap: 0.75rem;
  font-size: 0.9375rem;
}
.footer-link {
  color: var(--color-ice-blue);
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 4px;
  transition:
    color var(--dur-fast) var(--ease-out-soft),
    text-decoration-color var(--dur-fast) var(--ease-out-soft);
}
.footer-link:hover {
  color: var(--color-white);
  text-decoration-color: currentColor;
}

.footer-bottom {
  margin-top: 4rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem 2rem;
  border-top: 1px solid rgb(185 229 243 / 0.18);
  padding-top: 1.5rem;
  font-size: 0.875rem;
}
</style>
