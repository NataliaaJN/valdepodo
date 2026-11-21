<script setup lang="ts">
/**
 * La clínica (spec 05): una sola página que cuenta la historia Personas → Forma de trabajar →
 * Espacio. Hero con la foto del equipo (y los años de experiencia en su frase), equipo (#equipo), método en
 * línea de tiempo y el espacio de la clínica. El CTA de cierre lo pone el layout.
 * Sin fotos reales todavía: placeholders ilustrados marcados ("Fotografía pendiente"), nunca stock.
 * Schema `Person`: solo con datos confirmados (ahora ninguno).
 */
import { isPending, resolveValue } from '#shared/utils/pending'
import { clinic } from '~/data/clinic'
import { team } from '~/data/team'

usePageSeo({
  title: 'La clínica · Equipo y espacio',
  description:
    'El equipo y la clínica de Valdepodo: quiénes somos, cómo trabajamos y el espacio donde te atendemos.',
  path: '/conocenos',
})

const featured = team.filter((m) => m.profile)
const others = team.filter((m) => !m.profile)

const confirmedPeople = team.filter((m) => !isPending(m.name) && !isPending(m.role))
if (confirmedPeople.length) {
  useHead({
    script: [
      {
        key: 'schema-team',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(
          confirmedPeople.map((m) => ({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: m.name,
            jobTitle: m.role,
            worksFor: { '@id': '#clinica' },
          })),
        ),
      },
    ],
  })
}
</script>

<template>
  <div>
    <!-- Hero a pantalla completa: foto del equipo -->
    <ClinicHero id="about-title" title="Clínica de podología Valdepodo" :photo="clinic.teamPhoto" />

    <!-- 1. Personas: cabecera, perfiles ampliados (capítulo de tinta) y resto del equipo -->
    <section
      id="equipo"
      class="team-head pt-[clamp(3.5rem,6vw,5.5rem)] pb-[clamp(2rem,4vw,3rem)]"
      aria-labelledby="team-title"
      data-nav-theme="bone"
    >
      <div class="container-wide team-head__grid">
        <SectionHeading
          id="team-title"
          :title="{ before: 'Equipo' }"
          intro="Profesionales que te escuchan y te explican cada paso."
        />
        <nav v-if="featured.length" class="team-index" aria-label="Perfiles del equipo">
          <a v-for="m in featured" :key="m.id" :href="`#${m.id}`" class="team-index__link">
            <span>{{ resolveValue(m.name) }}</span>
            <BaseIcon name="arrow-right" class="size-5" />
          </a>
        </nav>
      </div>
    </section>

    <section
      v-if="featured.length"
      class="profiles chapter-ink py-[clamp(3.5rem,7vw,6.5rem)]"
      aria-label="Perfiles del equipo"
      data-nav-theme="ink"
    >
      <div class="container-wide profiles__list">
        <TeamProfile
          v-for="(m, i) in featured"
          :id="m.id"
          :key="m.id"
          :member="m"
          :flip="i % 2 === 1"
          class="profiles__item"
        />
      </div>
    </section>

    <section
      v-if="others.length"
      class="team py-[clamp(3rem,6vw,5rem)]"
      aria-labelledby="team-rest-title"
      data-nav-theme="bone"
    >
      <div class="container-wide">
        <h3 id="team-rest-title" class="team__sub">Y también en la clínica</h3>
        <div class="team__cards">
          <TeamCard v-for="(member, i) in others" :key="member.id" v-reveal="i" :member="member" />
        </div>
      </div>
    </section>

    <!-- 2. Forma de trabajar -->
    <MethodTimeline />

    <!-- 3. Espacio -->
    <section class="space py-[clamp(3.5rem,6vw,5.5rem)]" aria-labelledby="clinic-title" data-nav-theme="bone">
      <div class="container-wide">
        <div class="space__head">
          <SectionHeading id="clinic-title" :title="{ before: 'Un espacio pensado para cuidar de ti' }" />
          <ContentValue v-reveal="1" :value="clinic.spaceText" as="p" class="space__intro text-body-l" />
        </div>
        <MediaMosaic :photos="clinic.photos" class="mt-10 lg:mt-12" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.team-head__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
}
.team-index {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.team-index__link {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 2.75rem;
  padding: 0 1.125rem;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  font-weight: 600;
  color: var(--color-ink);
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft),
    translate var(--dur-base) var(--ease-out-soft);
}
.team-index__link:active {
  scale: 0.97;
}
@media (hover: hover) and (pointer: fine) {
  .team-index__link:hover {
    background: var(--color-ink);
    color: var(--color-bone);
    translate: 0 -2px;
  }
}
.profiles {
  background: var(--color-ink);
}
.profiles__list {
  display: grid;
  gap: clamp(4rem, 9vw, 8rem);
}
.profiles__item {
  scroll-margin-top: calc(var(--nav-h-compact) + 1.5rem);
}
.team__sub {
  margin-bottom: 1.5rem;
  font-family: var(--font-display);
  font-size: var(--text-heading-s);
  color: var(--color-ink);
}
.team__cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  gap: 1rem;
}
.space__head {
  display: grid;
  gap: 1.25rem;
}
.space__intro {
  max-width: 38ch;
  color: var(--color-text-secondary);
}
@media (min-width: 1024px) {
  .team-head__grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
    align-items: end;
  }
  .team-head__grid > :first-child {
    grid-column: 1 / span 7;
  }
  .team-index {
    grid-column: 9 / span 4;
    justify-content: flex-end;
  }
  .team__cards {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .space__head {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
    align-items: end;
  }
  .space__head > :first-child {
    grid-column: 1 / span 6;
  }
  .space__intro {
    grid-column: 9 / span 4;
    padding-bottom: 0.25rem;
  }
}
</style>
