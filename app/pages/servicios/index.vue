<script setup lang="ts">
/**
 * Índice de servicios: cabecera monumental, los cinco servicios con la misma composición fotográfica de la
 * Home (en grande) y, debajo, una lista editorial con la descripción y el «Te ayuda si…» de cada uno.
 */
import { bookingPath, servicePath, services } from '~/data/services'

usePageSeo({
  title: 'Servicios de podología',
  description:
    'Estudio biomecánico, plantillas personalizadas, podología general, podología infantil y pie diabético en Valdepodo.',
  path: '/servicios',
})
useBreadcrumbSchema([
  { name: 'Inicio', path: '/' },
  { name: 'Servicios', path: '/servicios' },
])
</script>

<template>
  <div>
    <PageHeader
      id="services-title"
      title="Servicios"
      eyebrow="(05) Qué hacemos"
      size="mega"
      :crumbs="[{ name: 'Inicio', to: '/' }, { name: 'Servicios' }]"
    />

    <section
      class="chapter-ink section-clip py-(--space-section)"
      data-nav-theme="ink"
      aria-label="Los cinco servicios"
    >
      <div class="container-wide">
        <ServiceTiles variant="index" />
      </div>
    </section>

    <section class="container-wide py-(--space-section)" aria-labelledby="detail-title">
      <h2 id="detail-title" class="sr-only">Detalle de cada servicio</h2>
      <ol class="rows" role="list">
        <li v-for="service in services" :key="service.slug" v-reveal class="row">
          <span class="row__num eyebrow">({{ service.number }})</span>
          <h3 class="row__name text-display-m">
            <NuxtLink :to="servicePath(service.slug)" class="row__link">{{ service.name }}</NuxtLink>
          </h3>
          <div class="row__body">
            <ContentValue
              :value="service.description"
              as="p"
              class="measure text-body-l text-text-secondary"
            />
            <ul class="needs" role="list" aria-label="Te ayuda si…">
              <li v-for="(need, n) in service.needs" :key="n">
                <ContentValue :value="need" />
              </li>
            </ul>
            <div class="row__actions">
              <BaseButton :to="servicePath(service.slug)" variant="secondary" size="sm" arrow>
                Ver servicio<span class="sr-only">: {{ service.name }}</span>
              </BaseButton>
              <BaseButton :to="bookingPath(service.slug)" variant="ghost">
                Pedir cita<span class="sr-only"> para {{ service.name.toLowerCase() }}</span>
              </BaseButton>
            </div>
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped>
.rows {
  border-bottom: 1px solid var(--color-border);
}
.row {
  display: grid;
  gap: 1.25rem;
  border-top: 1px solid var(--color-border);
  padding-block: clamp(2rem, 4vw, 3.5rem);
}
.row__num {
  color: var(--color-primary-strong);
}
.row__name {
  color: var(--color-ink);
}
.row__link {
  transition: color var(--dur-base) var(--ease-out-soft);
}
.needs {
  margin-top: 1.5rem;
  display: grid;
  gap: 0.5rem;
  color: var(--color-text);
}
.needs li {
  display: flex;
  gap: 0.75rem;
  border-top: 1px solid var(--color-border);
  padding-top: 0.5rem;
  font-size: 0.9375rem;
}
.needs li::before {
  content: '+';
  color: var(--color-primary-strong);
  font-weight: 600;
}
.row__actions {
  margin-top: 1.75rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.5rem;
}
@media (hover: hover) and (pointer: fine) {
  .row__link:hover {
    color: var(--color-primary);
  }
}

@media (min-width: 1024px) {
  .row {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
  }
  .row__num {
    grid-column: 1 / span 1;
    padding-top: 0.9rem;
  }
  .row__name {
    grid-column: 2 / span 5;
  }
  .row__body {
    grid-column: 8 / span 5;
  }
}
</style>
