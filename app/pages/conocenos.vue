<script setup lang="ts">
/**
 * La clínica (spec 05): una sola página que cuenta la historia Personas → Forma de trabajar → Experiencia →
 * Espacio. Hero con la foto del equipo, equipo (#equipo), método en línea de tiempo, los años de experiencia
 * como pausa y el espacio de la clínica. El CTA de cierre lo pone el layout.
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
    <!-- Hero: foto del equipo -->
    <ClinicHero
      id="about-title"
      title="Detrás de cada paso, hay personas."
      eyebrow="La clínica"
      :photo="clinic.teamPhoto"
    />

    <!-- 1. Personas -->
    <section id="equipo" class="team py-(--space-section)" aria-labelledby="team-title" data-nav-theme="bone">
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

    <!-- 3. Experiencia -->
    <ExperienceSection />

    <!-- 4. Espacio -->
    <section class="py-(--space-section)" aria-labelledby="clinic-title" data-nav-theme="bone">
      <div class="container-wide">
        <SectionHeading
          id="clinic-title"
          :title="{ before: 'Un espacio pensado para cuidar de ti' }"
          :intro="clinic.spaceText"
        />
        <MediaMosaic :photos="clinic.photos" class="mt-12" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.team__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 3rem;
}
.team__cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
  gap: 1rem;
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
    grid-template-columns: repeat(auto-fill, minmax(18rem, 23rem));
  }
}
</style>
