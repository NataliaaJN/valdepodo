<script setup lang="ts">
/**
 * Tarjeta de profesional (spec 05 §2), patrón disclosure accesible.
 * - Escritorio con puntero fino (≥ 1024): foto a sangre con nombre y cargo sobre un degradado; en hover,
 *   foco o con el botón "+" sube un panel glass con la descripción y las especialidades.
 * - Táctil / < 1024: todo visible bajo la foto (el botón no se muestra).
 * El contenido del panel está siempre en el DOM (nunca `display: none`): los lectores de pantalla lo leen
 * aunque esté plegado; `aria-expanded` refleja el estado visual.
 */
import { resolveValue } from '#shared/utils/pending'
import type { TeamMember } from '~/data/team'

const props = defineProps<{ member: TeamMember }>()
const open = ref(false)
const panelId = `team-panel-${props.member.id}`
const name = computed(() => resolveValue(props.member.name))
</script>

<template>
  <article class="team-card" :class="{ 'is-open': open }" :aria-labelledby="`${panelId}-name`">
    <div class="card-media">
      <img
        v-if="member.photo"
        :src="member.photo.src"
        :alt="member.photo.alt"
        width="800"
        height="1000"
        loading="lazy"
        class="card-photo"
      />
      <PhotoPlaceholder v-else ratio="4 / 5" variant="portrait" class="card-photo" />

      <div class="card-overlay" aria-hidden="true" />
      <div class="card-heading">
        <h3 :id="`${panelId}-name`" class="text-display-m">
          <ContentValue :value="member.name" />
        </h3>
        <ContentValue :value="member.role" as="p" class="mt-1 font-semibold" />
      </div>

      <div v-if="member.linkedin" class="card-social">
        <a
          :href="resolveValue(member.linkedin)"
          target="_blank"
          rel="noopener"
          class="glass grid size-11 place-items-center rounded-m text-deep-blue"
        >
          <BaseIcon name="linkedin" :label="`LinkedIn de ${name} (se abre en una pestaña nueva)`" />
        </a>
      </div>

      <button
        type="button"
        class="card-toggle glass"
        :aria-expanded="open"
        :aria-controls="panelId"
        :aria-label="`${open ? 'Ver menos' : 'Ver más'} sobre ${name}`"
        @click="open = !open"
      >
        <BaseIcon name="plus" class="toggle-icon size-5" />
      </button>

      <div :id="panelId" class="card-panel">
        <ContentValue :value="member.bio" as="p" class="text-text" />
        <ul class="mt-4 flex flex-wrap gap-2" role="list" aria-label="Especialidades">
          <li v-for="(s, i) in member.specialties" :key="i" class="tag">
            <ContentValue :value="s" />
          </li>
        </ul>
        <p v-if="member.license" class="mt-4 text-sm text-text-secondary">
          Nº de colegiada: <ContentValue :value="member.license" />
        </p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.team-card {
  position: relative;
}
.card-media {
  position: relative;
}
.card-photo {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: var(--radius-l);
}
.card-overlay,
.card-toggle,
.card-social {
  display: none;
}
.card-heading {
  margin-top: 1.25rem;
  color: var(--color-deep-blue);
}
.card-panel {
  margin-top: 1rem;
}
.tag {
  border-radius: var(--radius-s);
  background: var(--color-bone-2);
  padding: 0.3rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-deep-blue);
}

/* Escritorio con puntero fino: tarjeta con panel desplegable */
@media (min-width: 1024px) and (hover: hover) and (pointer: fine) {
  .card-media {
    overflow: hidden;
    border-radius: var(--radius-l);
  }
  .card-photo {
    border-radius: 0;
    transition:
      transform 600ms var(--ease-out-soft),
      object-position 600ms var(--ease-out-soft);
  }
  .card-overlay {
    display: block;
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgb(6 26 44 / 0.78), rgb(6 26 44 / 0) 50%);
    pointer-events: none;
  }
  .card-heading {
    position: absolute;
    left: 1.75rem;
    right: 5rem;
    bottom: 1.5rem;
    margin: 0;
    color: var(--color-white);
    transition: opacity var(--dur-base) var(--ease-out-soft);
  }
  .card-social {
    display: block;
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
  }
  .card-toggle {
    display: grid;
    place-items: center;
    position: absolute;
    right: 1.25rem;
    bottom: 1.25rem;
    z-index: 2;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-m);
    color: var(--color-deep-blue);
    cursor: pointer;
  }
  .toggle-icon {
    transition: transform var(--dur-base) var(--ease-out-soft);
  }
  .card-panel {
    position: absolute;
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    margin: 0;
    border-radius: var(--radius-m);
    padding: 1.5rem 4.5rem 1.5rem 1.5rem;
    background: color-mix(in oklab, white 82%, transparent);
    backdrop-filter: blur(16px) saturate(1.2);
    border: 1px solid rgb(255 255 255 / 0.7);
    opacity: 0;
    transform: translateY(16px);
    pointer-events: none;
    transition:
      opacity var(--dur-base) var(--ease-out-soft),
      transform var(--dur-base) var(--ease-out-soft);
  }
  .team-card:hover .card-photo,
  .is-open .card-photo {
    transform: scale(1.04);
    object-position: 50% 40%;
  }
  .team-card:hover .card-panel,
  .team-card:focus-within .card-panel,
  .is-open .card-panel {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }
  .team-card:hover .card-heading,
  .team-card:focus-within .card-heading,
  .is-open .card-heading {
    opacity: 0;
  }
  .is-open .toggle-icon {
    transform: rotate(45deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-photo,
  .card-panel,
  .toggle-icon {
    transition: opacity 150ms linear !important;
    transform: none !important;
  }
}
</style>
