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
    <!-- 1. Hero -->
    <section class="section-clip relative isolate" aria-labelledby="about-title">
      <div
        class="pointer-events-none absolute inset-0 -z-10 bg-(image:--grad-atmosphere)"
        aria-hidden="true"
      />
      <div class="container-site grid gap-10 pt-12 pb-16 lg:grid-cols-12 lg:items-center lg:pt-20 lg:pb-24">
        <div class="lg:col-span-5">
          <p class="eyebrow text-primary-strong">La clínica</p>
          <h1 id="about-title" class="mt-4 font-display text-display-l text-deep-blue">
            Detrás de cada paso, <em class="text-primary">hay personas</em>.
          </h1>
          <ContentValue
            :value="clinic.heroText"
            as="p"
            class="mt-6 max-w-[44ch] text-body-l text-text-secondary"
          />
        </div>
        <div class="hero-photo lg:col-span-7">
          <div class="orbit" aria-hidden="true"><OrganicLines /></div>
          <PhotoPlaceholder
            ratio="16 / 10"
            label="Fotografía del equipo pendiente"
            class="relative rounded-l"
          />
        </div>
      </div>
    </section>

    <!-- 2. Equipo -->
    <section id="equipo" class="bg-white py-(--space-section)" aria-labelledby="team-title">
      <div class="container-site">
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
    <section class="py-(--space-section)" aria-labelledby="clinic-title">
      <div class="container-site">
        <SectionHeading
          id="clinic-title"
          :title="{ before: 'Un espacio pensado para ', accent: 'cuidar de ti', after: '.' }"
        />
        <MediaMosaic :photos="clinic.photos" class="mt-12" />
      </div>
    </section>

    <!-- 4. Experiencia -->
    <div class="bg-white">
      <ExperienceSection />
    </div>

    <!-- 5. Filosofía -->
    <PhilosophyPath />

    <CtaBlock
      :title="{ before: 'Nos encantará ', accent: 'conocerte' }"
      :cta="{ label: 'Pedir cita', to: '/pedir-cita' }"
    />
  </div>
</template>

<style scoped>
.hero-photo {
  position: relative;
}
.orbit {
  position: absolute;
  inset: -8% -4%;
  pointer-events: none;
}
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
    margin-top: 64px;
  }
}
</style>
