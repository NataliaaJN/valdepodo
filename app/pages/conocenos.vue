<script setup lang="ts">
/**
 * La clínica (spec 05): una sola página que cuenta la historia Personas → Forma de trabajar →
 * Espacio. Hero con la foto del equipo (y los años de experiencia en su frase), equipo (#equipo), método en
 * línea de tiempo y el espacio de la clínica. El CTA de cierre lo pone el layout.
 * Sin fotos reales todavía: placeholders ilustrados marcados ("Fotografía pendiente"), nunca stock.
 * Schema `Person`: solo con datos confirmados (`useTeamSchema`).
 */
import { resolveValue } from '#shared/utils/pending'
import { site } from '~/data/site'
import { clinic } from '~/features/clinic/data/clinic'
import { team } from '~/features/clinic/data/team'

usePageSeo({
  title: `Equipo y clínica de podología en ${resolveValue(site.city)}`,
  description:
    'El equipo y la clínica de Valdepodo: quiénes somos, cómo trabajamos y el espacio donde te atendemos.',
  path: '/conocenos',
  type: 'AboutPage',
})

useTeamSchema(team)
</script>

<template>
  <div>
    <!-- Hero a pantalla completa: foto del equipo -->
    <ClinicHero id="about-title" title="Clínica de podología Valdepodo" :photo="clinic.teamPhoto" />

    <!-- 1. Personas: tarjetas iguales; la ficha completa se abre en un modal -->
    <section
      id="equipo"
      class="py-[clamp(3.5rem,6vw,5.5rem)]"
      aria-labelledby="team-title"
      data-nav-theme="bone"
    >
      <div class="container-wide">
        <SectionHeading
          id="team-title"
          :title="{ before: 'Equipo' }"
          intro="Profesionales que te escuchan y te explican cada paso."
        />
        <TeamMembers :members="team" class="mt-8 lg:mt-12" />
        <p class="mt-10 max-w-[60ch] text-body-l text-text-secondary">
          Conoce los
          <NuxtLink to="/servicios" class="font-semibold text-primary-strong underline underline-offset-4"
            >servicios de podología</NuxtLink
          >
          que ofrecemos o
          <NuxtLink to="/contacto#cita" class="font-semibold text-primary-strong underline underline-offset-4"
            >pide tu cita</NuxtLink
          >
          y empezamos por lo que más te preocupa.
        </p>
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
.space__head {
  display: grid;
  gap: 1.25rem;
}
.space__intro {
  max-width: 38ch;
  color: var(--color-text-secondary);
}
@media (min-width: 1024px) {
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
