<script setup lang="ts">
/**
 * Podología infantil (spec 04 §4): misma estructura común que podología general (cabecera · declaración
 * introductoria · sección principal). La sección principal reúne lo esencial: qué valoramos en la revisión y
 * cuándo conviene consultar. Sin tipografías ni colores "infantiles"; solo `reveal`.
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
        <li v-for="(item, i) in kids.assessments" :key="i" v-reveal="i" class="kids-assess__item">
          <span class="kids-assess__icon" aria-hidden="true"><BaseIcon name="check" /></span>
          <ContentValue :value="item" as="p" />
        </li>
      </ul>

      <h3 v-reveal class="kids-consult__title">Cuándo conviene consultar</h3>
      <ul class="kids-consult" role="list">
        <li v-for="(issue, i) in kids.gaitIssues" :key="issue.title" v-reveal="i" class="kids-consult__item">
          <h4 class="kids-consult__name">{{ issue.title }}</h4>
          <ContentValue :value="issue.text" as="p" class="kids-consult__text" />
        </li>
      </ul>
    </ServiceSection>

    <RelatedServices :current="service.slug" />
  </div>
</template>

<style scoped>
.kids-assess {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0 2.5rem;
}
.kids-assess__item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 0;
  border-top: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: var(--text-body-l);
  line-height: var(--text-body-l--line-height);
}
.kids-assess__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: var(--color-white);
  color: var(--color-primary-strong);
}
.kids-consult__title {
  margin-top: clamp(2.5rem, 5vw, 4rem);
  font-size: var(--text-heading-s);
  line-height: 1.12;
  color: var(--color-ink);
}
.kids-consult {
  margin-top: 1rem;
}
.kids-consult__item {
  padding: 1.5rem 0;
}
.kids-consult__item + .kids-consult__item {
  border-top: 1px solid var(--color-border);
}
.kids-consult__name {
  font-size: var(--text-body-l);
  font-weight: 600;
  color: var(--color-ink);
}
.kids-consult__text {
  margin-top: 0.5rem;
  max-width: 46ch;
  color: var(--color-text-secondary);
}
@media (min-width: 768px) {
  .kids-assess {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
