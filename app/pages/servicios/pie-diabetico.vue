<script setup lang="ts">
/**
 * Pie diabético (spec 04 §5): misma estructura común que podología general e infantil (cabecera · declaración
 * introductoria · secciones), con tres composiciones propias y sobrias, sin elementos flotantes:
 *  - «Qué incluye la revisión»: seis pasos numerados en dos columnas, como un protocolo.
 *  - «Señales que requieren valoración»: capítulo tinta con cuatro señales y el aviso de urgencias destacado.
 *  - «Cuidados de cada día»: filas editoriales con filetes, seguidas del descargo.
 */
import { diabetic } from '~/data/diabetic'

const service = useServicePage('pie-diabetico')
</script>

<template>
  <div>
    <ServiceHero :service="service" :description="diabetic.description" />

    <ServiceOverview :service="service" title="Cuidar tus pies es cuidar tu salud." :intro="diabetic.intro" />

    <ServiceSection id="diab-review-title" :title="diabetic.reviewTitle" tone="bone-2">
      <ol class="review" role="list">
        <li v-for="(step, i) in diabetic.review" :key="step.title" v-reveal="i % 2" class="review__item">
          <span class="review__num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3 class="review__name">{{ step.title }}</h3>
          <p class="review__text">{{ step.text }}</p>
        </li>
      </ol>
    </ServiceSection>

    <section class="signs chapter-ink section-clip" aria-labelledby="diab-signs-title" data-nav-theme="ink">
      <div class="container-wide signs__grid">
        <h2 id="diab-signs-title" v-reveal class="signs__title">{{ diabetic.signsTitle }}</h2>
        <ul class="signs__list" role="list">
          <li v-for="(s, i) in diabetic.signs" :key="s.title" v-reveal="i" class="sign">
            <span class="sign__icon" aria-hidden="true"><SignIcon :kind="s.icon" /></span>
            <div>
              <h3 class="sign__name">{{ s.title }}</h3>
              <p class="sign__text">{{ s.text }}</p>
            </div>
          </li>
        </ul>
        <div v-reveal class="urgent" role="note">
          <BaseIcon name="info" class="urgent__icon" />
          <p class="urgent__text"><span class="sr-only">Importante: </span>{{ diabetic.urgentNotice }}</p>
        </div>
      </div>
    </section>

    <ServiceSection id="diab-care-title" :title="diabetic.careTitle" tone="bone">
      <ul role="list">
        <li v-for="c in diabetic.care" :key="c.title" v-reveal class="care">
          <h3 class="care__name">{{ c.title }}</h3>
          <p class="care__text">{{ c.text }}</p>
        </li>
      </ul>
      <p class="disclaimer">{{ diabetic.disclaimer }}</p>
    </ServiceSection>

    <RelatedServices :current="service.slug" />
  </div>
</template>

<style scoped>
/* ---------- Revisión: protocolo numerado ---------- */
.review {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}
.review__item {
  padding: 1.5rem;
  border-radius: var(--radius-l);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  transition: translate var(--dur-base) var(--ease-out-soft);
}
.review__num {
  display: inline-grid;
  place-items: center;
  min-width: 2.75rem;
  height: 2.75rem;
  padding-inline: 0.5rem;
  border-radius: var(--radius-m);
  background: var(--color-cyan-light);
  font-family: var(--font-display);
  font-size: 1.125rem;
  color: var(--color-ink);
}
.review__name {
  margin-top: 1.25rem;
  font-size: var(--text-heading-s);
  line-height: 1.12;
  color: var(--color-ink);
}
.review__text {
  margin-top: 0.5rem;
  max-width: 38ch;
  color: var(--color-text);
}
@media (min-width: 640px) {
  .review {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* ---------- Señales: capítulo tinta ----------
   Escritorio: a la izquierda el título y el aviso de urgencias (siempre a la vista); a la derecha, las cuatro señales
   como cards 2 × 2 con su icono propio. Tablet y móvil: título, cards y aviso en una columna. */
.signs {
  padding-block: clamp(3.5rem, 7vw, 6rem);
}
.signs__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 3rem);
}
.signs__title {
  max-width: 14ch;
  font-size: var(--text-display-m);
  line-height: var(--text-display-m--line-height);
}
.signs__list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.875rem;
}
.sign {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: var(--radius-l);
  border: 1px solid var(--color-border);
  background: rgb(241 239 233 / 0.05);
  transition: translate var(--dur-base) var(--ease-out-soft);
}
.sign__icon {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: var(--color-cyan);
  color: var(--color-ink);
}
.sign__icon svg {
  width: 1.75rem;
  height: 1.75rem;
}
.sign__name {
  font-size: var(--text-heading-s);
  line-height: 1.12;
}
.sign__text {
  margin-top: 0.5rem;
  max-width: 34ch;
  color: var(--color-text-secondary);
}
.urgent {
  display: flex;
  gap: 1rem;
  margin-top: clamp(1.5rem, 3vw, 2rem);
  padding: 1.5rem;
  border-radius: var(--radius-l);
  background: var(--color-primary);
  color: var(--color-ink);
}
.urgent__icon {
  flex: none;
  width: 1.75rem;
  height: 1.75rem;
}
.urgent__text {
  max-width: 34ch;
  font-size: var(--text-body-l);
  font-weight: 600;
  line-height: 1.35;
}
@media (min-width: 640px) {
  .signs__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .signs__grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
    align-items: start;
  }
  .signs__title {
    grid-column: 1 / span 4;
    grid-row: 1;
  }
  .signs__list {
    grid-column: 5 / span 8;
    grid-row: 1 / span 2;
    gap: 1rem;
  }
  .urgent {
    grid-column: 1 / span 4;
    grid-row: 2;
    margin-top: 0;
  }
}

/* ---------- Cuidados: filas con filetes ---------- */
.care {
  display: grid;
  gap: 0.5rem;
  padding-block: 1.5rem;
}
.care + .care {
  border-top: 1px solid var(--color-border);
}
.care:first-child {
  padding-top: 0;
}
.care__name {
  font-size: var(--text-heading-s);
  line-height: 1.12;
  color: var(--color-ink);
}
.care__text {
  max-width: 46ch;
  color: var(--color-text);
}
.disclaimer {
  margin-top: 2rem;
  max-width: 56ch;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}
@media (min-width: 768px) {
  .care {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
    gap: 2rem;
    align-items: baseline;
  }
}

@media (hover: hover) and (pointer: fine) {
  .sign:hover,
  .review__item:hover {
    translate: 0 -2px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sign,
  .review__item {
    transition: none;
  }
}
</style>
