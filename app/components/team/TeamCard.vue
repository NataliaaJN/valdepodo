<script setup lang="ts">
/**
 * Profesional en card (spec 05 §2): retrato cuadrado arriba (los archivos son de 200 px: se muestran en
 * cards estrechas para no pixelarlos), cargo y nombre siempre visibles debajo y LinkedIn con nombre solo si
 * la persona lo autoriza. Descripción, especialidades y colegiación aparecen en la card cuando existan.
 * Sin foto: marcador «Fotografía pendiente». Nada depende del hover. En móvil la card se tumba (foto a la izquierda).
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
  grid-template-columns: 7rem minmax(0, 1fr);
  align-items: center;
  gap: 1rem;
  height: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-m);
  background: var(--color-white);
  padding: 0.75rem;
  transition:
    translate var(--dur-base) var(--ease-out-soft),
    border-color var(--dur-base) var(--ease-out-soft);
}
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
  align-content: start;
  gap: 0.375rem;
  min-width: 0;
}
.role {
  color: var(--color-text-secondary);
}
.name {
  font-size: var(--text-heading-s);
  line-height: 1.1;
  color: var(--color-ink);
}
.more {
  display: grid;
  gap: 0.75rem;
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
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-ink);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 6px;
  text-decoration-color: transparent;
  transition: text-decoration-color var(--dur-base) var(--ease-out-soft);
}

/* Desde tablet: card vertical, retrato arriba */
@media (min-width: 640px) {
  .person {
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    align-content: start;
    gap: 1.25rem;
    padding: 1rem;
  }
  .name {
    font-size: clamp(1.375rem, 1.1rem + 0.5vw, 1.625rem);
  }
}

@media (hover: hover) and (pointer: fine) {
  .person:hover {
    translate: 0 -2px;
    border-color: var(--color-border-strong);
  }
  .person:hover .photo {
    scale: 1.03;
  }
  .social:hover {
    text-decoration-color: currentColor;
  }
}
@media (prefers-reduced-motion: reduce) {
  .person,
  .photo {
    transition: none;
  }
  .person:hover,
  .person:hover .photo {
    translate: none;
    scale: 1;
  }
}
</style>
