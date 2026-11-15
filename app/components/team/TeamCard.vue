<script setup lang="ts">
/**
 * Profesional (spec 05 §2), pieza editorial: el retrato vertical manda (~80 % de la pieza), con esquinas de 8 px
 * y sin bordes ni sombras; debajo, solo el nombre, el cargo y el enlace a LinkedIn (si la persona lo autoriza).
 * Hover / foco: el retrato hace un zoom de 1,03 y se desplaza unos píxeles, aparece un velo muy ligero en el
 * azul de marca y una etiqueta «LinkedIn» sobre la foto. Sin hover (táctil) no se pierde nada: el enlace de
 * debajo siempre está a la vista. La foto también es un enlace, pero oculto para teclado y lectores (el enlace
 * accesible es el de texto). Sin foto: marcador «Fotografía pendiente».
 * La composición (tamaños y posiciones) la decide la página; la card solo llena su caja.
 */
import { resolveValue } from '#shared/utils/pending'
import type { TeamMember } from '~/data/team'

const props = defineProps<{ member: TeamMember }>()
const nameId = `team-${props.member.id}-name`
const name = computed(() => resolveValue(props.member.name))
const linkedin = computed(() => (props.member.linkedin ? resolveValue(props.member.linkedin) : null))
</script>

<template>
  <article class="person" :aria-labelledby="nameId">
    <component
      :is="linkedin ? 'a' : 'div'"
      :href="linkedin ?? undefined"
      :target="linkedin ? '_blank' : undefined"
      :rel="linkedin ? 'noopener' : undefined"
      :tabindex="linkedin ? -1 : undefined"
      :aria-hidden="linkedin ? 'true' : undefined"
      class="media"
    >
      <img
        v-if="member.photo"
        :src="member.photo.src"
        :alt="member.photo.alt"
        width="200"
        height="200"
        loading="lazy"
        class="photo"
      />
      <PhotoPlaceholder v-else ratio="auto" variant="portrait" class="photo" />
      <span class="tint" aria-hidden="true" />
      <span v-if="linkedin" class="hint" aria-hidden="true">
        LinkedIn <BaseIcon name="arrow-up-right" class="hint__icon" />
      </span>
    </component>

    <div class="info">
      <h3 :id="nameId" class="name">
        <ContentValue :value="member.name" />
      </h3>
      <p class="role"><ContentValue :value="member.role" /></p>
      <a v-if="linkedin" :href="linkedin" target="_blank" rel="noopener" class="social">
        LinkedIn<span class="sr-only"> de {{ name }} (se abre en una pestaña nueva)</span>
        <BaseIcon name="arrow-up-right" class="social__icon" />
      </a>
    </div>
  </article>
</template>

<style scoped>
.person {
  display: grid;
  grid-template-rows: auto auto;
  gap: 1rem;
  min-width: 0;
}

/* ---------- Retrato ---------- */
.media {
  position: relative;
  display: block;
  overflow: hidden;
  aspect-ratio: 5 / 6;
  border-radius: var(--radius-m);
  background: var(--color-ice);
  transform: translateZ(0);
}
.photo {
  position: absolute;
  inset: -2% 0;
  width: 100%;
  height: 104%;
  object-fit: cover;
  object-position: 50% 24%;
  transition:
    scale var(--dur-image) var(--ease-out-soft),
    translate var(--dur-image) var(--ease-out-soft);
}
.photo :deep(.ph-label) {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
}
/* Velo de marca muy ligero: aparece al señalar */
.tint {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(20 184 212 / 0.26), rgb(20 184 212 / 0) 55%);
  opacity: 0;
  transition: opacity 700ms var(--ease-out-soft);
  pointer-events: none;
}
.hint {
  position: absolute;
  left: 0.75rem;
  bottom: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: var(--radius-s);
  background: var(--color-bone);
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-ink);
  opacity: 0;
  translate: 0 6px;
  transition:
    opacity 450ms var(--ease-out-soft),
    translate 450ms var(--ease-out-soft);
  pointer-events: none;
}
.hint__icon {
  width: 0.875rem;
  height: 0.875rem;
}

/* ---------- Texto ---------- */
.info {
  display: grid;
  justify-items: start;
  gap: 0.25rem;
}
.name {
  font-size: var(--text-heading-s);
  line-height: 1.12;
  color: var(--color-ink);
}
.role {
  color: var(--color-text-secondary);
}
.social {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 2.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-ink);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 5px;
  text-decoration-color: rgb(6 26 44 / 0.3);
  transition: text-decoration-color var(--dur-base) var(--ease-out-soft);
}
.social__icon {
  width: 0.9375rem;
  height: 0.9375rem;
  transition: translate var(--dur-base) var(--ease-out-soft);
}

/* ---------- Hover / foco ---------- */
.person:focus-within .photo {
  scale: 1.03;
}
.person:focus-within .tint,
.person:focus-within .hint {
  opacity: 1;
  translate: 0 0;
}
.person:focus-within .social {
  text-decoration-color: currentColor;
}
@media (hover: hover) and (pointer: fine) {
  .person:hover .photo {
    scale: 1.03;
    translate: 0 -6px;
  }
  .person:hover .tint,
  .person:hover .hint {
    opacity: 1;
    translate: 0 0;
  }
  .person:hover .social {
    text-decoration-color: currentColor;
  }
  .person:hover .social__icon {
    translate: 2px -2px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .photo,
  .tint,
  .hint,
  .social__icon {
    transition-duration: 1ms;
  }
  .person:hover .photo,
  .person:focus-within .photo {
    scale: 1;
    translate: 0 0;
  }
}
</style>
