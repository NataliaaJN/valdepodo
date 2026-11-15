<script setup lang="ts">
/**
 * Card de profesional a imagen completa (spec 05 §2). Reposo: retrato a sangre con el cargo y el nombre sobre un
 * velo de tinta, abajo a la izquierda. Hover o foco: el bloque de texto se convierte en un panel hueso que
 * sube sobre la foto y despliega la información ampliada (descripción, especialidades, colegiación), «Pedir
 * cita» y LinkedIn (solo si la persona lo autoriza). Es un único bloque de texto (un solo `h3`), así que no se
 * duplica nada para los lectores de pantalla. Táctil y sin hover: el panel va desplegado siempre.
 * Los retratos son de 200 px, por eso la card es compacta; sin foto, marcador «Fotografía pendiente».
 */
import { resolveValue } from '#shared/utils/pending'
import type { TeamMember } from '~/data/team'

const props = defineProps<{ member: TeamMember }>()
const nameId = `team-${props.member.id}-name`
const name = computed(() => resolveValue(props.member.name))
</script>

<template>
  <article class="person" :aria-labelledby="nameId">
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
    <div class="scrim" aria-hidden="true" />

    <div class="info">
      <p class="role eyebrow"><ContentValue :value="member.role" /></p>
      <h3 :id="nameId" class="name">
        <ContentValue :value="member.name" />
      </h3>

      <div class="more">
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

          <div class="actions">
            <NuxtLink to="/contacto#cita" class="cta">
              Pedir cita<span class="sr-only"> en la clínica</span>
              <BaseIcon name="arrow-up-right" class="cta__icon" />
            </NuxtLink>
            <a
              v-if="member.linkedin"
              :href="resolveValue(member.linkedin)"
              target="_blank"
              rel="noopener"
              class="social"
            >
              <BaseIcon name="linkedin" class="size-4" />
              <span class="sr-only">LinkedIn de {{ name }} (se abre en una pestaña nueva)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.person {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  aspect-ratio: 1 / 1.12;
  border-radius: var(--radius-m);
  background: var(--color-ink);
  color: var(--color-bone);
  transform: translateZ(0);
  transition: translate var(--dur-base) var(--ease-out-soft);
}
.photo {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 22%;
  transition: scale var(--dur-image) var(--ease-out-soft);
}
.photo :deep(.ph-label) {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
}
/* Velo solo en la franja del texto: contraste AA del nombre sobre cualquier retrato */
.scrim {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(to top, rgb(6 26 44 / 0.82) 0%, rgb(6 26 44 / 0.35) 34%, transparent 58%);
  pointer-events: none;
}

/* Un solo bloque de texto: sobre la foto en reposo, panel hueso al señalar */
.info {
  position: absolute;
  inset-inline: 0.5rem;
  bottom: 0.5rem;
  border-radius: var(--radius-s);
  padding: 0.75rem 0.75rem 0.75rem;
  background: transparent;
  color: var(--color-bone);
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft);
}
.role {
  color: rgb(241 239 233 / 0.82);
  transition: color var(--dur-base) var(--ease-out-soft);
}
.name {
  margin-top: 0.25rem;
  font-size: clamp(1.375rem, 1.1rem + 0.5vw, 1.625rem);
  line-height: 1.1;
  color: inherit;
}
.more {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 550ms var(--ease-out-soft),
    opacity 400ms var(--ease-out-soft);
}
.more__inner {
  display: grid;
  gap: 0.75rem;
  min-height: 0;
  overflow: hidden;
}
.bio {
  padding-top: 0.75rem;
  font-size: 0.9375rem;
  line-height: 1.5;
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
.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}
.cta {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 2.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 5px;
  text-decoration-color: transparent;
  transition: text-decoration-color var(--dur-base) var(--ease-out-soft);
}
.cta__icon {
  width: 1rem;
  height: 1rem;
}
.social {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-s);
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft);
}

/* Estado abierto: hover, foco dentro (teclado) y táctil sin hover */
.person:focus-within .info {
  background: var(--color-bone);
  color: var(--color-ink);
}
.person:focus-within .role {
  color: var(--color-text-secondary);
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
    scale: 1.03;
  }
  .person:hover .info {
    background: var(--color-bone);
    color: var(--color-ink);
  }
  .person:hover .role {
    color: var(--color-text-secondary);
  }
  .person:hover .more {
    grid-template-rows: 1fr;
    opacity: 1;
  }
  .cta:hover {
    text-decoration-color: currentColor;
  }
  .social:hover {
    background: var(--color-ink);
    color: var(--color-bone);
  }
}
@media (hover: none), (pointer: coarse) {
  .info {
    background: var(--color-bone);
    color: var(--color-ink);
  }
  .role {
    color: var(--color-text-secondary);
  }
  .more {
    grid-template-rows: 1fr;
    opacity: 1;
  }
  .person {
    aspect-ratio: auto;
    min-height: 22rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .person,
  .photo,
  .info,
  .more {
    transition-duration: 1ms;
  }
  .person:hover,
  .person:hover .photo {
    translate: none;
    scale: 1;
  }
}
</style>
