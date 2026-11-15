<script setup lang="ts">
/**
 * Podología infantil (spec 04 §4): misma estructura común que podología general (cabecera · declaración
 * introductoria · sección principal). La sección principal reúne lo esencial: cuatro cards de lo que revisamos
 * (con ilustración propia) y un panel cyan con los motivos habituales de consulta.
 */
import { kids } from '~/data/kids'

const service = useServicePage('podologia-infantil')
</script>

<template>
  <div>
    <ServiceHero :service="service" :description="kids.description" />

    <ServiceOverview :service="service" title="Los pies también crecen." :intro="kids.intro" />

    <ServiceSection id="kids-main-title" title="Qué revisamos en sus pies" tone="bone-2">
      <ul class="kids-assess" role="list">
        <li v-for="(a, i) in kids.assessments" :key="a.title" v-reveal="i" class="kids-card">
          <div class="kids-card__art" aria-hidden="true">
            <KidsIllustration :kind="a.illustration" />
          </div>
          <h3 class="kids-card__name">{{ a.title }}</h3>
          <p class="kids-card__text">{{ a.text }}</p>
        </li>
      </ul>
      <p v-reveal class="kids-note">
        <span class="kids-note__dot" aria-hidden="true" />
        {{ kids.assessmentNote }}
      </p>

      <div v-reveal class="kids-consult">
        <h3 class="kids-consult__title">{{ kids.consultTitle }}</h3>
        <ul class="kids-consult__list" role="list">
          <li v-for="c in kids.consult" :key="c.title" class="kids-consult__item">
            <svg class="kids-consult__foot" viewBox="0 0 112 256" aria-hidden="true">
              <g style="--fp-fill: var(--color-primary); --fp-stroke: var(--color-primary-strong)">
                <Footprint side="right" variant="both" :stroke-width="9" />
              </g>
            </svg>
            <div>
              <h4 class="kids-consult__name">{{ c.title }}</h4>
              <p class="kids-consult__text">{{ c.text }}</p>
            </div>
          </li>
        </ul>
      </div>
    </ServiceSection>

    <RelatedServices :current="service.slug" />
  </div>
</template>

<style scoped>
/* ---------- Cards de lo que revisamos ---------- */
.kids-assess {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}
.kids-card {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0.75rem 1.5rem;
  border-radius: var(--radius-l);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  transition: translate var(--dur-base) var(--ease-out-soft);
}
.kids-card__art {
  aspect-ratio: 200 / 120;
  border-radius: var(--radius-m);
  background: var(--color-cyan-mist);
  padding: 0.75rem 1rem;
}
.kids-card__name {
  margin: 1.25rem 0.75rem 0;
  font-size: var(--text-heading-s);
  line-height: 1.12;
  color: var(--color-ink);
}
.kids-card__text {
  margin: 0.5rem 0.75rem 0;
  max-width: 34ch;
  color: var(--color-text);
}
.kids-note {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  color: var(--color-text-secondary);
}
.kids-note__dot {
  flex: none;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-primary);
}

/* ---------- Panel de motivos de consulta ---------- */
.kids-consult {
  margin-top: clamp(2.5rem, 5vw, 4rem);
  padding: clamp(1.5rem, 4vw, 2.5rem);
  border-radius: var(--radius-l);
  background: var(--color-cyan-light);
}
.kids-consult__title {
  font-size: var(--text-heading-s);
  line-height: 1.12;
  color: var(--color-ink);
}
.kids-consult__list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem 2.5rem;
  margin-top: clamp(1.5rem, 3vw, 2rem);
}
.kids-consult__item {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
}
.kids-consult__foot {
  flex: none;
  width: 0.875rem;
  margin-top: 0.2rem;
  rotate: 12deg;
}
.kids-consult__name {
  font-size: var(--text-body-l);
  font-weight: 600;
  line-height: 1.25;
  color: var(--color-ink);
}
.kids-consult__text {
  margin-top: 0.375rem;
  color: var(--color-text);
}

@media (min-width: 640px) {
  .kids-assess {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .kids-consult__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (hover: hover) and (pointer: fine) {
  .kids-card:hover {
    translate: 0 -2px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .kids-card {
    transition: none;
  }
}
</style>
