<script setup lang="ts">
/**
 * Tarjeta de profesional compacta (spec 05 §2). La fotografía es la protagonista:
 * - Reposo: nombre y cargo abajo a la izquierda sobre un velo de tinta; redes arriba a la derecha (solo si la
 *   persona las autoriza).
 * - Hover o foco (puntero fino): el degradado crece sobre la foto y, sobre su parte inferior, se despliega
 *   la descripción, las especialidades y la colegiación, de forma progresiva.
 * - Táctil: la información ampliada se ve siempre (no depende del hover).
 * El contenido ampliado está siempre en el DOM: los lectores de pantalla lo leen aunque esté plegado.
 * La tarjeta es enfocable (`tabindex="0"`) para que el teclado también la despliegue.
 */
import { resolveValue } from '#shared/utils/pending'
import type { TeamMember } from '~/data/team'

const props = defineProps<{ member: TeamMember }>()
const nameId = `team-${props.member.id}-name`
const name = computed(() => resolveValue(props.member.name))
</script>

<template>
  <article class="team-card" tabindex="0" :aria-labelledby="nameId">
    <div class="media">
      <img
        v-if="member.photo"
        :src="member.photo.src"
        :alt="member.photo.alt"
        width="800"
        height="1000"
        loading="lazy"
        class="photo"
      />
      <PhotoPlaceholder v-else ratio="4 / 5" variant="portrait" class="photo" />

      <div class="scrim scrim--base" aria-hidden="true" />
      
      <a
        v-if="member.linkedin"
        :href="resolveValue(member.linkedin)"
        target="_blank"
        rel="noopener"
        class="social"
      >
        <BaseIcon
          name="linkedin"
          :label="`LinkedIn de ${name} (se abre en una pestaña nueva)`"
          class="size-4"
        />
      </a>

      <div class="info">
        <h3 :id="nameId" class="name">
          <ContentValue :value="member.name" />
        </h3>
        <ContentValue :value="member.role" as="p" class="role" />

        <div v-if="member.bio || member.specialties.length || member.license" class="more">
          <div class="more__inner">
            <ContentValue v-if="member.bio" :value="member.bio" as="p" class="bio" />
            <ul v-if="member.specialties.length" class="tags" role="list" aria-label="Especialidades">
              <li v-for="(s, i) in member.specialties" :key="i" class="tag">
                <ContentValue :value="s" />
              </li>
            </ul>
            <p v-if="member.license" class="license">
              Nº de colegiada: <ContentValue :value="member.license" />
            </p>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.team-card {
  position: relative;
  border-radius: var(--radius-l);
  outline: none;
}
.team-card:focus-visible {
  box-shadow: var(--focus-ring);
  border-radius: var(--radius-l);
}
.media {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-l);
  background: var(--color-ink);
  color: var(--color-bone);
  isolation: isolate;
}
.photo {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: 50% 30%;
  transition: transform 900ms var(--ease-out-soft);
}
img.photo {
  display: block;
}
/* El marcador «Fotografía pendiente» sube a una esquina para no chocar con el texto */
.photo :deep(.ph-label) {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
}

/* Velo base (siempre) + velo ampliado (hover / foco / táctil) que se funde encima */
.scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
/* Velo mínimo, solo en la franja inferior donde va el texto; aparece con el hover / foco */
.scrim--base {
  background: linear-gradient(to top, rgb(6 26 44 / 0.78) 0%, rgb(6 26 44 / 0) 30%);
  opacity: 0;
  transition: opacity 500ms var(--ease-out-soft);
}
.scrim--full {
  display: none;
}

.social {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-s);
  background: rgb(6 26 44 / 0.5);
  color: var(--color-bone);
  transition: background-color var(--dur-base) var(--ease-out-soft);
}
.social:hover {
  background: var(--color-primary);
}

.info {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  z-index: 1;
  padding: 1.25rem;
}
.name,
.role {
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 450ms var(--ease-out-soft),
    transform 450ms var(--ease-out-soft);
}
.name {
  font-size: var(--text-heading-s);
  line-height: 1.1;
  color: var(--color-white);
}
.role {
  margin-top: 0.25rem;
  font-size: 0.9375rem;
  line-height: 1.35;
  color: var(--color-ice-blue);
}

/* Información ampliada: despliegue de altura (0fr → 1fr) + fundido, sin saltos */
.more {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 600ms var(--ease-out-soft),
    opacity 450ms var(--ease-out-soft);
}
.more__inner {
  overflow: hidden;
  min-height: 0;
}
.bio {
  padding-top: 0.875rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: rgb(255 255 255 / 0.92);
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.75rem;
}
.tag {
  border: 1px solid rgb(241 239 233 / 0.4);
  border-radius: var(--radius-s);
  padding: 0.2rem 0.6rem;
  font-size: 0.8125rem;
  font-weight: 500;
}
.license {
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: var(--color-ice-blue);
}

@media (hover: hover) and (pointer: fine) {
  .team-card:hover .photo,
  .team-card:focus-within .photo,
  .team-card:focus-visible .photo {
    transform: scale(1.04);
  }
  .team-card:hover .scrim--base,
  .team-card:focus-within .scrim--base,
  .team-card:focus-visible .scrim--base {
    opacity: 1;
  }
  .team-card:hover :is(.name, .role),
  .team-card:focus-within :is(.name, .role),
  .team-card:focus-visible :is(.name, .role) {
    opacity: 1;
    transform: none;
  }
  .team-card:hover .more,
  .team-card:focus-within .more,
  .team-card:focus-visible .more {
    grid-template-rows: 1fr;
    opacity: 1;
  }
}

/* Táctil: sin hover, la información queda siempre visible */
@media (hover: none), (pointer: coarse) {
  .scrim--base,
  .name,
  .role {
    opacity: 1;
    transform: none;
  }
  .more {
    grid-template-rows: 1fr;
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .photo,
  .scrim--base,
  .name,
  .role,
  .more {
    transition-duration: 1ms;
  }
  .team-card:hover .photo {
    transform: none;
  }
}
</style>
