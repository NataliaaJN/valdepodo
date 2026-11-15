<script setup lang="ts">
/**
 * La clínica (spec 05): una sola página que cuenta la historia Personas → Forma de trabajar →
 * Espacio. Hero con la foto del equipo (y los años de experiencia en su frase), equipo (#equipo), método en
 * línea de tiempo y el espacio de la clínica. El CTA de cierre lo pone el layout.
 * Sin fotos reales todavía: placeholders ilustrados marcados ("Fotografía pendiente"), nunca stock.
 * Schema `Person`: solo con datos confirmados (ahora ninguno).
 */
import { isPending } from '#shared/utils/pending'
import { clinic } from '~/data/clinic'
import { team } from '~/data/team'

usePageSeo({
  title: 'La clínica · Equipo y espacio',
  description:
    'El equipo y la clínica de Valdepodo: quiénes somos, cómo trabajamos y el espacio donde te atendemos.',
  path: '/conocenos',
})

const { years } = useClinic()

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
    <ClinicHero id="about-title" title="Clínica de podología Valdepodo" :photo="clinic.teamPhoto">
      <p>Paula y Valerie, podólogas y copropietarias, con {{ years }} años cuidando de tus pies.</p>
      <BaseButton to="/contacto#cita" variant="on-blue" arrow class="mt-6">Pedir cita</BaseButton>
    </ClinicHero>

    <!-- 1. Personas -->
    <section
      id="equipo"
      class="team py-[clamp(3.5rem,6vw,5.5rem)]"
      aria-labelledby="team-title"
      data-nav-theme="bone"
    >
      <div class="container-wide team__grid">
        <SectionHeading
          id="team-title"
          :title="{ before: 'Equipo' }"
          intro="Profesionales que te escuchan y te explican cada paso."
        />
        <div class="team__cards">
          <TeamCard v-for="(member, i) in team" :key="member.id" v-reveal="i" :member="member" />
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
        <MediaMosaic :photos="clinic.photos" class="mt-8 lg:mt-10" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.team__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
}
.team__cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
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
  .team__grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
    align-items: start;
  }
  .team__grid > :first-child {
    grid-column: 1 / span 4;
  }
  .team__cards {
    grid-column: 5 / span 8;
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
