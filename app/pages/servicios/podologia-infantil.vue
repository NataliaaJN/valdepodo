<script setup lang="ts">
/**
 * Podología infantil (spec 04 §4): misma estructura común que podología general (cabecera · declaración
 * introductoria · secciones). Dos secciones principales distintas entre sí:
 *  - «Qué revisamos»: composición bento a todo el ancho (marcha grande, arco, dedos, calzado y una pieza de cierre).
 *  - «Cuándo conviene consultar»: banda cyan propia con los motivos habituales en tres columnas.
 */
import { kids } from '~/data/kids'

const service = useServicePage('podologia-infantil')

const [gait, arch, toes, shoe] = kids.assessments
</script>

<template>
  <div>
    <ServiceHero :service="service" :description="kids.description" />

    <ServiceOverview :service="service" title="Los pies también crecen." :intro="kids.intro" />

    <ServiceSection id="kids-main-title" title="Qué revisamos en sus pies" tone="bone-2" layout="stacked">
      <div class="bento">
        <article v-reveal class="tile tile--gait">
          <div class="tile__art" aria-hidden="true"><KidsIllustration :kind="gait!.illustration" /></div>
          <h3 class="tile__name">{{ gait!.title }}</h3>
          <p class="tile__text">{{ gait!.text }}</p>
        </article>

        <article v-reveal="1" class="tile tile--arch">
          <div class="tile__copy">
            <h3 class="tile__name">{{ arch!.title }}</h3>
            <p class="tile__text">{{ arch!.text }}</p>
          </div>
          <div class="tile__art tile__art--side" aria-hidden="true">
            <KidsIllustration :kind="arch!.illustration" />
          </div>
        </article>

        <article v-reveal="2" class="tile tile--toes">
          <div class="tile__art" aria-hidden="true"><KidsIllustration :kind="toes!.illustration" /></div>
          <h3 class="tile__name">{{ toes!.title }}</h3>
          <p class="tile__text">{{ toes!.text }}</p>
        </article>

        <article v-reveal="3" class="tile tile--shoe">
          <div class="tile__art" aria-hidden="true"><KidsIllustration :kind="shoe!.illustration" /></div>
          <h3 class="tile__name">{{ shoe!.title }}</h3>
          <p class="tile__text">{{ shoe!.text }}</p>
        </article>

        <p v-reveal="4" class="tile tile--note">
          <svg class="tile__foot" viewBox="0 0 112 256" aria-hidden="true">
            <g style="--fp-fill: var(--color-primary); --fp-stroke: var(--color-primary)">
              <Footprint side="right" variant="both" :stroke-width="5" />
            </g>
          </svg>
          {{ kids.assessmentNote }}
        </p>
      </div>
    </ServiceSection>

    <section class="consult chapter-blue section-clip" aria-labelledby="kids-consult-title" data-nav-theme="bone">
      <div class="container-wide">
        <h2 id="kids-consult-title" v-reveal class="consult__title">{{ kids.consultTitle }}</h2>
        <ul class="consult__list" role="list">
          <li v-for="(c, i) in kids.consult" :key="c.title" v-reveal="i % 3" class="consult__item">
            <span class="consult__mark" aria-hidden="true">
              <svg viewBox="0 0 112 256" class="consult__foot">
                <g style="--fp-fill: var(--color-ink); --fp-stroke: var(--color-ink)">
                  <Footprint side="right" variant="both" :stroke-width="6" />
                </g>
              </svg>
            </span>
            <h3 class="consult__name">{{ c.title }}</h3>
            <p class="consult__text">{{ c.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <RelatedServices :current="service.slug" />
  </div>
</template>

<style scoped>
/* ---------- Bento: qué revisamos ---------- */
.bento {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}
.tile {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0.75rem 1.5rem;
  border-radius: var(--radius-l);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  transition: translate var(--dur-base) var(--ease-out-soft);
}
.tile__art {
  flex: 1 1 auto;
  min-height: 9rem;
  border-radius: var(--radius-m);
  background: var(--color-cyan-mist);
  padding: 0.75rem 1rem;
}
.tile__name {
  margin: 1.25rem 0.75rem 0;
  font-size: var(--text-heading-s);
  line-height: 1.12;
  color: var(--color-ink);
}
.tile__text {
  margin: 0.5rem 0.75rem 0;
  max-width: 34ch;
  color: var(--color-text);
}
/* Marcha: la pieza grande, con la ilustración a todo el alto */
.tile--gait .tile__art {
  min-height: 16rem;
  background: var(--color-cyan-light);
  padding: 1.5rem;
}
.tile--gait .tile__name {
  font-size: var(--text-display-s, var(--text-heading-s));
}
/* Arco: pieza horizontal, texto a un lado e ilustración al otro */
.tile--arch {
  flex-direction: column-reverse;
}
.tile--arch .tile__copy {
  padding: 0.75rem 0.75rem 0;
}
.tile--arch .tile__name,
.tile--arch .tile__text {
  margin-inline: 0;
}
.tile__art--side {
  flex: none;
  min-height: 0;
  aspect-ratio: 200 / 110;
}
/* Pieza de cierre: tinta, a todo el ancho */
.tile--note {
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 0;
  background: var(--color-ink);
  color: var(--color-bone);
  font-size: var(--text-body-l);
  line-height: var(--text-body-l--line-height);
}
.tile__foot {
  flex: none;
  width: 1.25rem;
  rotate: 12deg;
}

@media (min-width: 640px) {
  .bento {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .tile--gait,
  .tile--arch,
  .tile--note {
    grid-column: 1 / -1;
  }
  .tile--arch {
    flex-direction: row;
    align-items: center;
    padding: 1.5rem 0.75rem 1.5rem 1.5rem;
  }
  .tile--arch .tile__copy {
    flex: 1 1 50%;
    padding: 0;
  }
  .tile__art--side {
    flex: 1 1 50%;
  }
}
@media (min-width: 1024px) {
  .bento {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: auto auto auto;
  }
  .tile--gait {
    grid-column: 1 / span 2;
    grid-row: 1 / span 2;
  }
  .tile--arch {
    grid-column: 3 / span 2;
    grid-row: 1;
  }
  .tile--toes {
    grid-column: 3;
    grid-row: 2;
  }
  .tile--shoe {
    grid-column: 4;
    grid-row: 2;
  }
  .tile--note {
    grid-column: 1 / -1;
    grid-row: 3;
  }
  .tile--toes .tile__name,
  .tile--shoe .tile__name {
    font-size: 1.375rem;
  }
}

/* ---------- Banda de motivos de consulta ---------- */
.consult {
  padding-block: clamp(3.5rem, 7vw, 6rem);
}
.consult__title {
  max-width: 18ch;
  font-size: var(--text-display-m);
  line-height: var(--text-display-m--line-height);
}
.consult__list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0 2rem;
  margin-top: clamp(2rem, 5vw, 3.5rem);
}
.consult__item {
  padding: 1.5rem 0 1.75rem;
  border-top: 1px solid var(--color-border);
}
.consult__mark {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: var(--color-white);
}
.consult__foot {
  width: 0.9rem;
  rotate: 12deg;
}
.consult__name {
  margin-top: 1.25rem;
  font-size: var(--text-heading-s);
  line-height: 1.12;
  color: var(--color-ink);
}
.consult__text {
  margin-top: 0.625rem;
  max-width: 36ch;
  color: var(--color-text-secondary);
}
@media (min-width: 640px) {
  .consult__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .consult__list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0 2.5rem;
  }
}

@media (hover: hover) and (pointer: fine) {
  .tile:not(.tile--note):hover {
    translate: 0 -2px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .tile {
    transition: none;
  }
}
</style>
