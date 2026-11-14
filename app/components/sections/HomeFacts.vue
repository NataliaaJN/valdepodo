<script setup lang="ts">
/**
 * Datos de la clínica bajo el hero: una línea fina de texto, sin iconos ni tarjetas, con un punto coral
 * como único detalle. Es una pieza pequeña de paso, no una sección con peso propio. El contenido son los `values`.
 */
import { site } from '~/data/site'
import { values } from '~/data/values'

const clinic = useClinic()

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
      <ul class="facts__list" role="list">
        <li v-for="item in items" :key="item.id" class="fact">
          <span>
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
  background: var(--color-bone);
  border-block: 1px solid var(--color-border);
}
.facts__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem 1.5rem;
  padding-block: 1rem;
}
.fact {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: var(--color-ink);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.3;
}
.fact::before {
  content: '';
  flex: none;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-coral);
}

@media (min-width: 1024px) {
  .facts__list {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    padding-block: 1.125rem;
  }
}
</style>
