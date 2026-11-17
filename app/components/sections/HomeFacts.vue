<script setup lang="ts">
/**
 * Datos de la clínica bajo el hero: tarjetas de cristal esmerilado sobre un fondo celeste suave. Cada una lleva
 * icono de línea cian, el concepto en grande y una línea de apoyo; en la de experiencia manda la cifra.
 * Los conceptos son los `values`; las líneas de apoyo son provisionales hasta que la clínica las valide.
 */
import type { IconName } from '~/components/base/BaseIcon.vue'
import { site } from '~/data/site'
import { values, type ValueIcon } from '~/data/values'

const clinic = useClinic()
const icons: Record<ValueIcon, IconName> = {
  years: 'calendar',
  care: 'heart',
  technology: 'shield',
  location: 'map-pin',
}
const support: Record<ValueIcon, string> = {
  years: 'de experiencia',
  care: 'atención personalizada',
  technology: 'medios adecuados',
  location: 'fácil acceso',
}

/** «{years} años de experiencia» → título «años» con la cifra aparte; el resto, tal cual. */
const items = computed(() =>
  values.map((v) => ({
    id: v.id,
    title: v.id === 'years' ? 'años' : v.title,
    support: support[v.id],
  })),
)
</script>

<template>
  <section class="facts relative" data-nav-theme="bone" aria-labelledby="datos-title">
    <h2 id="datos-title" class="sr-only">Valdepodo en datos</h2>
    <div class="container-wide">
      <ul class="facts__list" role="list">
        <li v-for="item in items" :key="item.id" class="fact">
          <BaseIcon :name="icons[item.id]" class="fact__icon" aria-hidden="true" />
          <p class="fact__title">
            <ContentValue v-if="item.id === 'years'" :value="site.foundedYear" as="span">{{
              clinic.years
            }}</ContentValue>
            {{ item.title }}
          </p>
          <p class="fact__support">{{ item.support }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.facts {
  z-index: 2;
  padding-block: 1.75rem;
  color: var(--color-ink);
  background:
    radial-gradient(60% 120% at 12% 0%, rgb(255 255 255 / 0.75), transparent 60%),
    radial-gradient(50% 120% at 90% 100%, var(--color-cyan-light), transparent 70%),
    var(--color-cyan-mist);
}
.facts__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}
.fact {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 1.25rem 0.75rem 1.125rem;
  text-align: center;
  border-radius: 1.25rem;
  background: linear-gradient(160deg, rgb(255 255 255 / 0.7), rgb(255 255 255 / 0.38));
  border: 1px solid rgb(255 255 255 / 0.85);
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.9) inset,
    0 10px 30px -12px rgb(20 120 160 / 0.22);
  -webkit-backdrop-filter: blur(14px) saturate(1.3);
  backdrop-filter: blur(14px) saturate(1.3);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}
.fact:hover {
  transform: translateY(-2px);
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.9) inset,
    0 16px 34px -12px rgb(20 120 160 / 0.3);
}
.fact__icon {
  width: 2rem;
  height: 2rem;
  margin-bottom: 0.625rem;
  color: #0e8fb5;
}
.fact__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.1875rem;
  line-height: 1.15;
  letter-spacing: -0.02em;
  text-wrap: balance;
}
.fact__support {
  font-size: 0.8125rem;
  line-height: 1.3;
  color: rgb(6 26 44 / 0.62);
  text-wrap: balance;
}

@media (min-width: 1024px) {
  .facts {
    padding-block: 2.25rem;
  }
  .facts__list {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1.25rem;
  }
  .fact {
    padding: 1.75rem 1.25rem 1.5rem;
  }
  .fact__icon {
    width: 2.25rem;
    height: 2.25rem;
  }
  .fact__title {
    font-size: 1.4375rem;
  }
  .fact__support {
    font-size: 0.9375rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fact,
  .fact:hover {
    transition: none;
    transform: none;
  }
}
</style>
