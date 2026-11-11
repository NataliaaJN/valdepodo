<script setup lang="ts">
/**
 * Datos de la clínica, FUERA del hero: una cápsula de vidrio (glassmorphism) con cuatro elementos en línea,
 * icono de línea azul + texto corto en dos líneas, todo con el mismo peso y tamaño, sin tarjetas.
 * La cápsula cabalga sobre el borde del hero (mitad sobre él, mitad sobre esta sección), de modo que el
 * cambio de fondo queda cubierto sin tocar el hero. El contenido son los `values`.
 */
import type { IconName } from '~/components/base/BaseIcon.vue'
import { site } from '~/data/site'
import { values, type ValueIcon } from '~/data/values'

const clinic = useClinic()
const icons: Record<ValueIcon, IconName> = {
  years: 'clock',
  care: 'heart',
  technology: 'spark',
  location: 'map-pin',
}

/** «Trato cercano» tal cual; «{years} años de experiencia» → «de experiencia» tras «N años» (ContentValue). */
const items = computed(() =>
  values.map((v) => ({
    id: v.id,
    rest: v.title.startsWith('{years}') ? v.title.split(' ').slice(2).join(' ') : v.title,
  })),
)
</script>

<template>
  <section class="facts relative" data-nav-theme="bone" aria-labelledby="datos-title">
    <h2 id="datos-title" class="sr-only">Valdepodo en datos</h2>
    <div class="container-wide">
      <ul class="facts__capsule" role="list">
        <li v-for="(item, i) in items" :key="item.id" v-reveal="i" class="fact">
          <BaseIcon :name="icons[item.id]" class="fact__icon" aria-hidden="true" />
          <span class="fact__text">
            <template v-if="item.id === 'years'">
              <ContentValue :value="site.foundedYear" as="span">{{ clinic.years }}</ContentValue> años
            </template>
            {{ item.rest }}
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.facts {
  z-index: 2;
  /* Hueco para la mitad inferior de la cápsula; la superior queda sobre el pie del hero */
  padding-block: 0 clamp(2.5rem, 4vw, 3.5rem);
  /* Cian clarito de la familia del hero */
  background: linear-gradient(180deg, #d9f0fa 0%, #e6f6fc 100%);
}
.facts__capsule {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem 1rem;
  max-width: 62rem;
  margin-inline: auto;
  padding: 1.5rem 1.5rem;
  /* En móvil solo asoma un poco sobre el hero (el titular queda justo encima) */
  transform: translateY(-1rem);
  margin-bottom: 0;
  border-radius: 1.75rem;
  border: 1px solid rgb(255 255 255 / 0.8);
  background: rgb(255 255 255 / 0.5);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  box-shadow:
    0 20px 44px -22px rgb(18 112 182 / 0.35),
    inset 0 1px 0 rgb(255 255 255 / 0.7);
}
.fact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-ink);
}
.fact__icon {
  flex: none;
  width: 1.75rem;
  height: 1.75rem;
  color: var(--color-primary);
}
/* Un solo estilo para todo el texto: mismo tamaño y peso en las dos líneas */
.fact__text {
  max-width: 9.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25;
}

@media (min-width: 1024px) {
  .facts__capsule {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1.5rem 3rem;
    /* Desde escritorio, la mitad de su alto cabalga sobre el hero */
    transform: translateY(-50%);
    margin-bottom: -2.75rem;
    border-radius: 999px;
  }
  .fact {
    gap: 0.875rem;
  }
  .fact__icon {
    width: 2rem;
    height: 2rem;
  }
}
</style>
