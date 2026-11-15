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
      </div>
    </ServiceSection>

    <section class="consult chapter-blue section-clip" aria-labelledby="kids-consult-title" data-nav-theme="bone">
      <div class="container-wide">
        <h2 id="kids-consult-title" v-reveal class="consult__title">{{ kids.consultTitle }}</h2>
        <ol class="path" role="list">
          <li
            v-for="(c, i) in kids.consult"
            :key="c.title"
            v-reveal
            class="step"
            :class="i % 2 ? 'step--right' : 'step--left'"
            :style="{ '--i': i }"
          >
            <span class="step__mark" aria-hidden="true">
              <svg viewBox="0 0 112 256" class="step__foot">
                <g style="--fp-fill: var(--color-primary); --fp-stroke: var(--color-ink)">
                  <Footprint :side="i % 2 ? 'right' : 'left'" variant="both" :stroke-width="9" />
                </g>
              </svg>
            </span>
            <div class="step__card">
              <h3 class="step__name">{{ c.title }}</h3>
              <p class="step__text">{{ c.text }}</p>
            </div>
          </li>
        </ol>
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

@media (min-width: 640px) {
  .bento {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .tile--gait,
  .tile--arch {
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
  .tile--toes .tile__name,
  .tile--shoe .tile__name {
    font-size: 1.375rem;
  }
}

/* ---------- Banda de motivos de consulta: camino de pasos ----------
   Sobre el cyan de marca, una línea de puntos central con una huella por motivo: pie izquierdo → tarjeta a la
   izquierda, pie derecho → tarjeta a la derecha, cada una media fila más abajo que la anterior (como al caminar).
   Los bordes exteriores de las dos columnas coinciden con los del contenedor. En móvil, el camino pasa a la izquierda. */
.consult {
  padding-block: clamp(3.5rem, 7vw, 6rem);
  --mark: 3rem;
}
.consult__title {
  max-width: 14ch;
  font-size: var(--text-display-m);
  line-height: var(--text-display-m--line-height);
}
.path {
  position: relative;
  display: grid;
  gap: 0.875rem;
  margin-top: clamp(2rem, 5vw, 3.5rem);
  padding-left: calc(var(--mark) + 1rem);
}
.path::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--mark) / 2);
  border-left: 3px dotted rgb(6 26 44 / 0.4);
}
.step {
  position: relative;
}
.step__mark {
  position: absolute;
  top: 50%;
  left: calc(-1 * (var(--mark) + 1rem));
  display: grid;
  place-items: center;
  width: var(--mark);
  height: var(--mark);
  translate: 0 -50%;
  border-radius: 50%;
  background: var(--color-white);
  box-shadow: 0 0 0 6px var(--color-primary);
}
.step__foot {
  width: 0.95rem;
}
.step--left .step__foot {
  rotate: -10deg;
}
.step--right .step__foot {
  rotate: 10deg;
}
.step__card {
  padding: 1.125rem 1.25rem 1.25rem;
  border-radius: var(--radius-l);
  background: var(--color-white);
  transition: translate var(--dur-base) var(--ease-out-soft);
}
.step__name {
  font-size: var(--text-body-l);
  font-weight: 600;
  line-height: 1.25;
  color: var(--color-ink);
}
.step__text {
  margin-top: 0.375rem;
  color: var(--color-text-secondary);
}

@media (min-width: 1024px) {
  .consult {
    --mark: 3.75rem;
    --path-gap: clamp(5rem, 9vw, 8rem);
  }
  .path {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: var(--path-gap);
    row-gap: 0.875rem;
    grid-auto-rows: minmax(3.75rem, auto);
    padding-left: 0;
  }
  .path::before {
    left: 50%;
    translate: -1.5px 0;
  }
  .step {
    grid-row: calc(var(--i) + 1) / span 2;
  }
  .step--left {
    grid-column: 1;
  }
  .step--right {
    grid-column: 2;
  }
  .step__card {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 1.25rem 1.75rem;
  }
  /* Huella sobre la línea central, con un hilo de puntos hasta la tarjeta */
  .step--left .step__mark {
    left: auto;
    right: calc(-1 * (var(--path-gap) / 2 + var(--mark) / 2));
  }
  .step--right .step__mark {
    left: calc(-1 * (var(--path-gap) / 2 + var(--mark) / 2));
  }
  .step__card::after {
    content: '';
    position: absolute;
    top: 50%;
    width: calc(var(--path-gap) / 2 - var(--mark) / 2);
    border-top: 3px dotted rgb(6 26 44 / 0.4);
  }
  .step--left .step__card::after {
    left: 100%;
  }
  .step--right .step__card::after {
    right: 100%;
  }
}

@media (hover: hover) and (pointer: fine) {
  .step:hover .step__card {
    translate: 0 -2px;
  }
  .tile:hover {
    translate: 0 -2px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .tile,
  .step__card {
    transition: none;
  }
}
</style>
