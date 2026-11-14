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
    <section class="space py-(--space-section)" aria-labelledby="clinic-title" data-nav-theme="bone">
      <div class="container-wide space__grid">
        <SectionHeading
          id="clinic-title"
          :title="{ before: 'Un espacio pensado para cuidar de ti' }"
          :intro="clinic.spaceText"
        />
        <div v-reveal="1" class="space__photo">
          <img
            :src="clinic.spacePhoto.src"
            :alt="clinic.spacePhoto.alt"
            width="1376"
            height="768"
            loading="lazy"
            decoding="async"
          />
        </div>
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
  grid-template-columns: minmax(0, 1fr);
}
.space__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(1.5rem, 4vw, 3rem);
}
.space__photo {
  overflow: hidden;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-m);
  background: var(--color-bone-2);
}
.space__photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: scale var(--dur-image) var(--ease-out-soft);
}
@media (hover: hover) and (pointer: fine) {
  .space__photo:hover img {
    scale: 1.03;
  }
}
@media (min-width: 1024px) {
  .space__grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
    align-items: center;
  }
  .space__grid > :first-child {
    grid-column: 1 / span 4;
  }
  .space__photo {
    grid-column: 6 / span 7;
  }
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
}
</style>
