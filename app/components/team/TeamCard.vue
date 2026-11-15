<script setup lang="ts">
/**
 * Profesional (spec 05 §2): card clara con el retrato cuadrado dentro (los archivos son de 200 px: el cuadrado
 * es el formato que menos los amplía) y, debajo, nombre y cargo. Rasgos propios de Valdepodo:
 *  - Tratamiento fotográfico de la casa (el mismo de las piezas de servicios): monocromo azul de marca en
 *    reposo, color al señalar. Unifica retratos con fondos y uniformes distintos. En táctil, siempre en color.
 *  - LinkedIn (solo si la persona lo autoriza) va en una «muesca» recortada en la esquina de la foto, con
 *    esquinas cóncavas: el botón forma parte de la silueta de la card, no flota encima.
 * Lo esencial está a la vista desde el principio. Hover: la card sube 2 px, la foto vuelve a color con un zoom de
 * 1,03 y el icono se rellena; si existe `bio`, se despliega. Sin foto: marcador «Fotografía pendiente».
 */
import { resolveValue } from '#shared/utils/pending'
import type { TeamMember } from '~/data/team'

const props = defineProps<{ member: TeamMember }>()
const nameId = `team-${props.member.id}-name`
const name = computed(() => resolveValue(props.member.name))
</script>

<template>
  <article class="person" :aria-labelledby="nameId">
    <div class="media">
      <img
        v-if="member.photo"
        :src="member.photo.src"
        :alt="member.photo.alt"
        width="200"
        height="200"
        loading="lazy"
        class="photo"
      />
      <PhotoPlaceholder v-else ratio="1 / 1" variant="portrait" class="photo" />
      <span class="tint" aria-hidden="true" />

      <div v-if="member.linkedin" class="notch">
        <a :href="resolveValue(member.linkedin)" target="_blank" rel="noopener" class="social">
          <BaseIcon name="linkedin" class="size-5" />
          <span class="sr-only">LinkedIn de {{ name }} (se abre en una pestaña nueva)</span>
        </a>
      </div>
    </div>

    <div class="info">
      <h3 :id="nameId" class="name">
        <ContentValue :value="member.name" />
      </h3>
      <p class="role"><ContentValue :value="member.role" /></p>

      <div v-if="member.bio" class="more">
        <ContentValue :value="member.bio" as="p" class="bio" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.person {
  display: grid;
  gap: 0.875rem;
  padding: 0.5rem 0.5rem 1rem;
  border-radius: var(--radius-m);
  background: var(--color-white);
  box-shadow: var(--shadow-soft);
  transition: translate var(--dur-base) var(--ease-out-soft);
}

/* ---------- Retrato ---------- */
.media {
  --r: 0.875rem;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  aspect-ratio: 1;
  border-radius: var(--radius-s);
  background: var(--color-ink);
  transform: translateZ(0);
}
.photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 24%;
  filter: grayscale(1) contrast(1.08) brightness(1.05);
  scale: 1;
  transition:
    scale var(--dur-image) var(--ease-out-soft),
    filter 1000ms var(--ease-out-soft);
}
.photo :deep(.ph-label) {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
}
/* Capa de color de marca en multiply: monocromo azul en reposo */
.tint {
  position: absolute;
  inset: 0;
  background: var(--color-cyan-light);
  mix-blend-mode: multiply;
  opacity: 0.95;
  transition: opacity 1000ms var(--ease-out-soft);
  pointer-events: none;
}

/* Muesca de LinkedIn: del color de la card, con esquinas cóncavas hacia la foto */
.notch {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-top-left-radius: var(--r);
  background: var(--color-white);
}
.notch::before,
.notch::after {
  content: '';
  position: absolute;
  width: var(--r);
  height: var(--r);
  background: radial-gradient(circle at 0 0, transparent calc(var(--r) - 0.5px), var(--color-white) var(--r));
  pointer-events: none;
}
.notch::before {
  left: calc(-1 * var(--r));
  bottom: 0;
}
.notch::after {
  right: 0;
  top: calc(-1 * var(--r));
}
.social {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-s);
  background: var(--color-ice);
  color: var(--color-ink);
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft),
    scale var(--dur-fast) var(--ease-out-soft);
}
.social:active {
  scale: 0.96;
}

/* ---------- Texto ---------- */
.info {
  padding-inline: 0.5rem;
}
.name {
  font-size: clamp(1.25rem, 1.1rem + 0.35vw, 1.5rem);
  line-height: 1.12;
  color: var(--color-ink);
}
.role {
  margin-top: 0.25rem;
  font-size: 0.9375rem;
  line-height: 1.35;
  color: var(--color-text-secondary);
}

/* Descripción breve: aparece al señalar (en táctil, siempre) */
.more {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 500ms var(--ease-out-soft),
    opacity 350ms var(--ease-out-soft);
}
.bio {
  min-height: 0;
  overflow: hidden;
  padding-top: 0.75rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--color-text);
}

/* ---------- Hover / foco ---------- */
.person:focus-within .photo {
  filter: grayscale(0) contrast(1.02) brightness(1);
}
.person:focus-within .tint {
  opacity: 0.18;
}
.person:focus-within .more {
  grid-template-rows: 1fr;
  opacity: 1;
}
@media (hover: hover) and (pointer: fine) {
  .person:hover {
    translate: 0 -2px;
  }
  .person:hover .photo {
    filter: grayscale(0) contrast(1.02) brightness(1);
    scale: 1.03;
  }
  .person:hover .tint {
    opacity: 0.18;
  }
  .person:hover .more {
    grid-template-rows: 1fr;
    opacity: 1;
  }
  .social:hover {
    background: var(--color-ink);
    color: var(--color-bone);
  }
}
/* Táctil: sin hover, retrato en color y descripción visible */
@media (hover: none), (pointer: coarse) {
  .photo {
    filter: none;
  }
  .tint {
    opacity: 0;
  }
  .more {
    grid-template-rows: 1fr;
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .person,
  .photo,
  .tint,
  .more,
  .social {
    transition-duration: 1ms;
  }
  .person:hover,
  .person:hover .photo {
    translate: none;
    scale: 1;
  }
}
</style>
