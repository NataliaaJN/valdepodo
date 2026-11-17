<script setup lang="ts">
/**
 * Pausa bajo el hero: un panel de tinta sobre cian muy claro, con curvas de nivel como las de un mapa de
 * presiones plantares, la cifra de años como protagonista y dos valores más (trato, tecnología).
 * Textos de apoyo provisionales hasta que la clínica los valide.
 */
import { site } from '~/data/site'

const clinic = useClinic()
</script>

<template>
  <section class="facts relative" data-nav-theme="bone" aria-labelledby="datos-title">
    <h2 id="datos-title" class="sr-only">Valdepodo en datos</h2>
    <div class="container-wide">
      <ul class="panel" role="list">
        <li class="item item--years">
          <ContentValue :value="site.foundedYear" as="span" class="years">{{ clinic.years }}</ContentValue>
          <p class="item__text">
            <strong class="item__title">años de experiencia</strong>
            <span class="item__support">cuidando la salud de tus pies</span>
          </p>
        </li>
        <li class="item">
          <span class="badge"><BaseIcon name="heart" class="badge__icon" aria-hidden="true" /></span>
          <p class="item__text">
            <strong class="item__title">Trato cercano</strong>
            <span class="item__support">atención personalizada y escucha activa</span>
          </p>
        </li>
        <li class="item">
          <span class="badge"><BaseIcon name="shield" class="badge__icon" aria-hidden="true" /></span>
          <p class="item__text">
            <strong class="item__title">Tecnología y calidad</strong>
            <span class="item__support">medios adecuados para cada diagnóstico</span>
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.facts {
  z-index: 2;
  padding-block: clamp(1.5rem, 4vw, 3rem);
  background: var(--color-cyan-mist);
  color: var(--color-white);
}
.panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  overflow: hidden;
  border-radius: clamp(1.25rem, 2.5vw, 2rem);
  background:
    radial-gradient(55% 140% at 6% 0%, rgb(20 184 212 / 0.32), transparent 62%),
    linear-gradient(135deg, #0a2a44 0%, var(--color-ink) 70%);
  box-shadow: 0 30px 60px -30px rgb(6 26 44 / 0.55);
}
/* Curvas de nivel: anillos finos que se desvanecen hacia el centro, como un mapa de presiones */
.panel::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-radial-gradient(
    circle at 96% 120%,
    transparent 0 26px,
    rgb(200 241 250 / 0.13) 26px 27px
  );
  -webkit-mask-image: radial-gradient(60% 130% at 96% 120%, #000, transparent 72%);
  mask-image: radial-gradient(60% 130% at 96% 120%, #000, transparent 72%);
}
.item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.125rem;
  padding: 1.5rem 1.5rem;
}
.item + .item {
  border-top: 1px solid rgb(200 241 250 / 0.14);
}
.years {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(4.5rem, 12vw, 7rem);
  line-height: 0.8;
  letter-spacing: -0.06em;
  background: linear-gradient(170deg, #c8f1fa 10%, var(--color-cyan) 70%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.badge {
  display: grid;
  flex: none;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: linear-gradient(160deg, rgb(20 184 212 / 0.28), rgb(20 184 212 / 0.06));
  box-shadow: inset 0 0 0 1px rgb(200 241 250 / 0.3);
}
.badge__icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-ice-blue);
}
.item__text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.item__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.25rem;
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.item__support {
  font-size: 0.9375rem;
  line-height: 1.35;
  color: rgb(200 241 250 / 0.72);
}

@media (min-width: 900px) {
  .panel {
    grid-template-columns: 1.15fr 1fr 1fr;
  }
  .item {
    padding: 2.25rem 2.25rem;
  }
  .item + .item {
    border-top: 0;
    border-left: 1px solid rgb(200 241 250 / 0.14);
  }
  .item__title {
    font-size: 1.375rem;
  }
}
</style>
