<script setup lang="ts">
/**
 * Podología infantil (spec 04 §4). Estética amable: más aire, formas redondeadas, huellas pequeñas,
 * ice-blue más presente; sin tipografías ni colores "infantiles". Solo `reveal` y aparición de huellas.
 */
import { kids } from '~/data/kids'

const service = useServicePage('podologia-infantil')
</script>

<template>
  <div>
    <ServiceHero :service="service" :description="kids.description" />

    <ServiceOverview :service="service" title="Los pies también crecen.">
      <GrowingFootprints class="mx-auto max-w-[30rem]" />
    </ServiceOverview>

    <!-- 2. Introducción al desarrollo del pie -->
    <section class="container-site grid gap-12 py-(--space-section) lg:grid-cols-12 lg:items-center">
      <div class="lg:col-span-6">
        <SectionHeading
          :title="{ before: 'Un pie en ', accent: 'desarrollo', after: '.' }"
          :intro="kids.intro"
        />
      </div>
      <div v-reveal class="mx-auto w-full max-w-[16rem] lg:col-span-4 lg:col-start-9" aria-hidden="true">
        <svg viewBox="-20 -16 152 288" class="w-full overflow-visible">
          <g style="--fp-fill: var(--color-light-blue)"><Footprint side="right" variant="both" /></g>
          <g
            transform="translate(22 52) scale(0.6)"
            style="--fp-fill: transparent; --fp-stroke: var(--color-cyan)"
          >
            <Footprint side="right" variant="outline" :stroke-width="2" />
          </g>
        </svg>
      </div>
    </section>

    <!-- 3. Qué podemos valorar -->
    <section class="kids-tint py-(--space-section)" aria-labelledby="kids-assess">
      <div class="container-site">
        <SectionHeading id="kids-assess" :title="{ before: 'Qué podemos ', accent: 'valorar', after: '' }" />
        <ul class="mt-10 grid gap-x-10 gap-y-6 md:grid-cols-2" role="list">
          <li
            v-for="(item, i) in kids.assessments"
            :key="i"
            v-reveal="i"
            class="flex gap-4 rounded-l bg-white/80 p-5"
          >
            <span
              class="grid size-10 flex-none place-items-center rounded-m bg-light-blue text-primary-strong"
            >
              <BaseIcon name="check" />
            </span>
            <ContentValue :value="item" as="p" class="self-center text-body-l text-text" />
          </li>
        </ul>
      </div>
    </section>

    <!-- 4. Desarrollo del pie por edades: solo hitos validados -->
    <section
      v-if="kids.milestones.length"
      class="container-site py-(--space-section)"
      aria-labelledby="kids-timeline"
    >
      <SectionHeading
        id="kids-timeline"
        :title="{ before: 'Cómo cambia ', accent: 'con la edad', after: '' }"
      />
      <ol class="mt-10 grid gap-6 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
        <li v-for="m in kids.milestones" :key="m.age" v-reveal class="border-t-2 border-primary pt-4">
          <p class="eyebrow text-primary-strong">{{ m.age }}</p>
          <p class="mt-2 text-text-secondary">{{ m.text }}</p>
        </li>
      </ol>
    </section>

    <!-- 5. Forma de caminar -->
    <section class="container-site grid gap-12 py-(--space-section) lg:grid-cols-12 lg:items-center">
      <div class="lg:col-span-5">
        <SectionHeading
          :title="{ before: 'Su forma de ', accent: 'caminar', after: '' }"
          :intro="kids.gait"
        />
      </div>
      <div class="lg:col-span-6 lg:col-start-7" style="--fp-fill: var(--color-ice-blue)">
        <FootprintTrail
          :steps="8"
          :width="600"
          :height="220"
          :from="[20, 180]"
          :control="[300, 40]"
          :to="[580, 170]"
          :scale="0.15"
        />
      </div>
    </section>

    <!-- 6. Alteraciones de la marcha -->
    <section class="bg-white py-(--space-section)" aria-labelledby="kids-issues">
      <div class="container-site grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <SectionHeading
            id="kids-issues"
            :title="{ before: 'Cuándo conviene ', accent: 'consultar', after: '' }"
          />
        </div>
        <ul class="border-t border-border lg:col-span-7 lg:col-start-6" role="list">
          <li
            v-for="(issue, i) in kids.gaitIssues"
            :key="issue.title"
            v-reveal="i"
            class="border-b border-border py-6"
          >
            <h3 class="text-heading-s font-semibold text-deep-blue">{{ issue.title }}</h3>
            <ContentValue :value="issue.text" as="p" class="mt-2 text-text-secondary" />
          </li>
        </ul>
      </div>
    </section>

    <!-- 7. Seguimiento y prevención -->
    <section class="container-site py-(--space-section)" aria-labelledby="kids-follow">
      <SectionHeading
        id="kids-follow"
        :title="{ before: 'Seguimiento y ', accent: 'prevención', after: '' }"
      />
      <StepList :steps="kids.followUp" horizontal class="mt-12" />
      <aside v-reveal class="kids-advice mt-12 flex gap-4 rounded-l p-6">
        <BaseIcon name="info" class="mt-0.5 size-6 text-primary-strong" />
        <ContentValue :value="kids.advice" as="p" class="text-body-l text-deep-blue" />
      </aside>
    </section>

    <RelatedServices :slugs="service.related" />
  </div>
</template>

<style scoped>
.kids-tint {
  background: var(--color-bone-2);
}
.kids-advice {
  background: var(--color-white);
  border: 1px solid var(--color-border);
}
</style>
