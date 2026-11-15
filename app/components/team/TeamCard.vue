<script setup lang="ts">
/**
 * Profesional (spec 05 §2): card clara con el retrato cuadrado dentro (los archivos son de 200 px: el cuadrado
 * es el formato que menos los amplía), y debajo nombre, cargo y el icono de LinkedIn (solo si la persona lo
 * autoriza). Lo esencial está a la vista desde el principio, también en táctil; el hover aporta movimiento
 * sutil (zoom 1,03 de la foto, la card sube 2 px, el icono se rellena) y, cuando exista, despliega una
 * descripción breve (`bio`). Sin foto: marcador «Fotografía pendiente».
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
    </div>

    <div class="info">
      <div class="info__row">
        <div class="info__text">
          <h3 :id="nameId" class="name">
            <ContentValue :value="member.name" />
          </h3>
          <p class="role"><ContentValue :value="member.role" /></p>
        </div>
        <a
          v-if="member.linkedin"
          :href="resolveValue(member.linkedin)"
          target="_blank"
          rel="noopener"
          class="social"
        >
          <BaseIcon name="linkedin" class="size-5" />
          <span class="sr-only">LinkedIn de {{ name }} (se abre en una pestaña nueva)</span>
        </a>
      </div>

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
  padding: 0.5rem 0.5rem 0.875rem;
  border-radius: var(--radius-m);
  background: var(--color-white);
  box-shadow: var(--shadow-soft);
  transition: translate var(--dur-base) var(--ease-out-soft);
}

/* ---------- Retrato ---------- */
.media {
  position: relative;
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
  transition: scale var(--dur-image) var(--ease-out-soft);
}
.photo :deep(.ph-label) {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
}

/* ---------- Texto ---------- */
.info {
  padding-inline: 0.5rem;
}
.info__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.info__text {
  min-width: 0;
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
.social {
  flex: none;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-s);
  background: var(--color-ice);
  color: var(--color-ink);
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft);
}
.social:active {
  scale: 0.96;
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
.person:focus-within .more {
  grid-template-rows: 1fr;
  opacity: 1;
}
@media (hover: hover) and (pointer: fine) {
  .person:hover {
    translate: 0 -2px;
  }
  .person:hover .photo {
    scale: 1.03;
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
@media (hover: none), (pointer: coarse) {
  .more {
    grid-template-rows: 1fr;
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .person,
  .photo,
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
