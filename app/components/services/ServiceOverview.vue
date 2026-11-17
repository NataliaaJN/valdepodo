<script setup lang="ts">
/**
 * Primera sección de toda página de servicio, tras la cabecera: la frase del servicio y su descripción.
 *  - Con recurso visual (mapa de presión, plantilla, huellas…): título a la izquierda y, a la derecha, la
 *    descripción y el recurso debajo, con su rótulo (disposición estándar de `ServiceSection`).
 *  - Solo texto (título + descripción): composición de declaración propia, para que la sección no parezca una
 *    sección estándar a medio llenar: la frase a todo el ancho (un escalón por debajo del título de la cabecera), un filete de marca y la descripción
 *    en una columna desplazada debajo.
 */
import type { Maybe } from '#shared/utils/pending'
import type { Service } from '~/data/services'

defineProps<{ service: Service; title: string; intro?: Maybe<string> }>()
defineSlots<{ default?: () => unknown; caption?: () => unknown }>()
</script>

<template>
  <ServiceSection v-if="$slots.default" :id="`${service.slug}-overview`" :title="title" tone="bone">
    <div class="overview">
      <ContentValue v-if="intro" v-reveal="1" :value="intro" as="p" class="overview__intro" />
      <figure v-reveal="2" class="overview__visual">
        <slot />
        <figcaption v-if="$slots.caption" class="overview__caption"><slot name="caption" /></figcaption>
      </figure>
    </div>
  </ServiceSection>

  <section
    v-else
    class="statement chapter-bone section-clip"
    :aria-labelledby="`${service.slug}-overview`"
    data-nav-theme="bone"
  >
    <div class="container-wide">
      <h2 :id="`${service.slug}-overview`" v-reveal class="statement__title">{{ title }}</h2>
      <div class="statement__row">
        <span class="statement__rule" aria-hidden="true" />
        <ContentValue v-if="intro" v-reveal="1" :value="intro" as="p" class="statement__intro" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ---------- Con recurso visual ---------- */
.overview {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2.5rem);
}
.overview__intro {
  max-width: 40ch;
  font-size: var(--text-body-l);
  line-height: var(--text-body-l--line-height);
  color: var(--color-text);
}
.overview__visual {
  width: 100%;
  max-width: 34rem;
  border-radius: var(--radius-m);
  background: var(--color-bone-2);
  padding: clamp(1.5rem, 3vw, 2.5rem);
}
.overview__caption {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

/* ---------- Solo texto: declaración ---------- */
.statement {
  padding-block: clamp(3.5rem, 7vw, 6.5rem);
}
.statement__title {
  max-width: 22ch;
  font-size: var(--text-display-m);
  line-height: var(--text-display-m--line-height);
  color: var(--color-ink);
}
.statement__row {
  display: grid;
  gap: 1.25rem;
  margin-top: clamp(1.75rem, 4vw, 3rem);
}
.statement__rule {
  display: block;
  width: 3.5rem;
  height: 4px;
  border-radius: 2px;
  background: var(--color-primary);
}
.statement__intro {
  max-width: 36ch;
  font-size: var(--text-body-l);
  line-height: var(--text-body-l--line-height);
  color: var(--color-text);
}
@media (min-width: 1024px) {
  .statement__row {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
    align-items: start;
  }
  .statement__rule {
    grid-column: 1 / span 1;
    margin-top: 0.75em;
  }
  .statement__intro {
    grid-column: 6 / span 5;
  }
}
</style>
