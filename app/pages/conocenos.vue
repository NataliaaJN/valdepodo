<script setup lang="ts">
/**
 * Conócenos (spec 05): hero, equipo (#equipo), clínica (mosaico + lightbox), experiencia, filosofía y CTA.
 * Sin fotos reales todavía: placeholders ilustrados marcados ("Fotografía pendiente"), nunca stock.
 * Schema `Person`: solo con datos confirmados (ahora ninguno).
 */
import { isPending } from '#shared/utils/pending'
import { clinic } from '~/data/clinic'
import { team } from '~/data/team'

usePageSeo({
  title: 'Conócenos · Equipo y clínica',
  description:
    'El equipo y la clínica de Valdepodo: quiénes somos, cómo trabajamos y nuestra forma de entender la podología.',
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
    <!-- 1. Cabecera -->
    <PageHeader
      id="about-title"
      title="Detrás de cada paso, hay personas."
      eyebrow="La clínica"
      tone="bone-2"
    >
      <ContentValue :value="clinic.heroText" as="span" />
    </PageHeader>
    <div class="chapter-bone-2 pb-(--space-section)" data-nav-theme="bone">
      <div class="container-wide">
        <PhotoPlaceholder v-reveal ratio="21 / 9" label="Fotografía del equipo pendiente" class="rounded-m" />
      </div>
    </div>

    <!-- 2. Equipo -->
    <section id="equipo" class="py-(--space-section)" aria-labelledby="team-title" data-nav-theme="bone">
      <div class="container-wide">
        <SectionHeading
          id="team-title"
          eyebrow="Equipo"
          :title="{ before: 'Quién te ', accent: 'atiende', after: '' }"
        />
        <div class="team-grid mt-12">
          <TeamCard v-for="(member, i) in team" :key="member.id" v-reveal="i" :member="member" />
        </div>
      </div>
    </section>

    <!-- 3. Clínica -->
    <section class="pb-(--space-section)" aria-labelledby="clinic-title" data-nav-theme="bone">
      <div class="container-wide">
        <SectionHeading
          id="clinic-title"
          :title="{ before: 'Un espacio pensado para ', accent: 'cuidar de ti', after: '.' }"
        />
        <MediaMosaic :photos="clinic.photos" class="mt-12" />
      </div>
    </section>

    <!-- 4. Experiencia -->
    <ExperienceSection />

    <!-- 5. Filosofía -->
    <PhilosophyPath />

    <CtaBlock
      :title="{ before: 'Nos encantará ', accent: 'conocerte' }"
      :cta="{ label: 'Pedir cita', to: '/pedir-cita' }"
    />
  </div>
</template>

<style scoped>
.team-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 3rem;
}
@media (min-width: 768px) {
  .team-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem;
  }
}
@media (min-width: 1024px) {
  .team-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
  .team-grid > :nth-child(1) {
    grid-column: 2 / span 5;
  }
  .team-grid > :nth-child(2) {
    grid-column: 7 / span 5;
    margin-top: 96px;
  }
}
</style>
