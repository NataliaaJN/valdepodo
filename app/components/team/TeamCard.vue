<script setup lang="ts">
/**
 * Profesional en fila editorial (spec 05 §2): retrato cuadrado a su tamaño nativo (los archivos son de
 * 200 px: ampliarlos a una tarjeta grande los pixelaba), nombre grande y cargo siempre visibles, y
 * LinkedIn como enlace con nombre solo si la persona lo autoriza. Descripción, especialidades y colegiación
 * aparecen en la misma fila cuando existan. Nada depende del hover.
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
      <p class="role eyebrow"><ContentValue :value="member.role" /></p>
      <h3 :id="nameId" class="name">
        <ContentValue :value="member.name" />
      </h3>

      <div v-if="member.bio || member.specialties.length || member.license" class="more">
        <ContentValue v-if="member.bio" :value="member.bio" as="p" class="bio" />
        <ul v-if="member.specialties.length" class="tags" role="list" aria-label="Especialidades">
          <li v-for="(s, i) in member.specialties" :key="i" class="tag">
            <ContentValue :value="s" />
          </li>
        </ul>
        <p v-if="member.license" class="license">Nº de colegiada: <ContentValue :value="member.license" /></p>
      </div>

      <a
        v-if="member.linkedin"
        :href="resolveValue(member.linkedin)"
        target="_blank"
        rel="noopener"
        class="social"
      >
        <BaseIcon name="linkedin" class="size-4" />
        <span>LinkedIn de {{ name }}<span class="sr-only"> (se abre en una pestaña nueva)</span></span>
      </a>
    </div>
  </article>
</template>

<style scoped>
.person {
  display: grid;
  grid-template-columns: clamp(6.5rem, 26vw, 12.5rem) minmax(0, 1fr);
  align-items: center;
  gap: clamp(1rem, 3vw, 2.5rem);
  border-top: 1px solid var(--color-border);
  padding-block: clamp(1.25rem, 2.5vw, 2rem);
}
.person:last-child {
  border-bottom: 1px solid var(--color-border);
}
.media {
  overflow: hidden;
  aspect-ratio: 1;
  border-radius: var(--radius-m);
  background: var(--color-ink);
  transform: translateZ(0);
}
.photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 25%;
  transition: scale var(--dur-image) var(--ease-out-soft);
}
.photo :deep(.ph-label) {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
}

.info {
  display: grid;
  justify-items: start;
  gap: 0.5rem;
  min-width: 0;
}
.role {
  color: var(--color-text-secondary);
}
.name {
  font-size: var(--text-display-m);
  line-height: 1;
  color: var(--color-ink);
}
.more {
  display: grid;
  gap: 0.75rem;
  max-width: 44ch;
  margin-top: 0.5rem;
}
.bio {
  line-height: 1.5;
  color: var(--color-text);
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}
.tag {
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-s);
  padding: 0.2rem 0.6rem;
  font-size: 0.8125rem;
  font-weight: 500;
}
.license {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.social {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  margin-top: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-ink);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 6px;
  text-decoration-color: transparent;
  transition: text-decoration-color var(--dur-base) var(--ease-out-soft);
}
@media (hover: hover) and (pointer: fine) {
  .person:hover .photo {
    scale: 1.03;
  }
  .social:hover {
    text-decoration-color: currentColor;
  }
}
@media (prefers-reduced-motion: reduce) {
  .photo {
    transition: none;
  }
  .person:hover .photo {
    scale: 1;
  }
}
</style>
