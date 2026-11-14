<script setup lang="ts">
/**
 * Pie diabético (spec 04 §5). Estética sobria: más blanco, sin degradados ni elementos flotantes,
 * ilustraciones mínimas. Solo `reveal`. Las señales llevan icono (no solo color) y el aviso de urgencias
 * va destacado; las recomendaciones, con su descargo.
 */
import { diabetic } from '~/data/diabetic'

const service = useServicePage('pie-diabetico')
</script>

<template>
  <div style="--reveal-shift: 12px">
    <ServiceHero
      :service="service"
      :title="{ before: 'Cuidar tus pies es cuidar tu ', accent: 'salud', after: '.' }"
      :description="diabetic.description"
    >
      <div class="mx-auto w-full max-w-[14rem]" aria-hidden="true">
        <ServiceGraphic kind="control" :active="false" />
      </div>
    </ServiceHero>

    <!-- 1. Importancia de la prevención -->
    <section class="container-site border-t border-border py-(--space-section)">
      <div class="grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-5">
          <SectionHeading :title="{ before: 'La importancia de la ', accent: 'prevención', after: '' }" />
        </div>
        <ContentValue
          v-reveal
          :value="diabetic.prevention"
          as="p"
          class="measure text-body-l text-text-secondary lg:col-span-6 lg:col-start-7"
        />
      </div>
    </section>

    <!-- 2. Cuidados y atención podológica -->
    <section class="container-site border-t border-border py-(--space-section)">
      <SectionHeading :title="{ before: 'Cuidados y atención ', accent: 'podológica', after: '' }" />
      <ul class="mt-10 grid gap-8 md:grid-cols-3" role="list">
        <li v-for="(item, i) in diabetic.care" :key="item.title" v-reveal="i">
          <span class="font-display text-heading-s text-primary-strong">0{{ i + 1 }}</span>
          <h3 class="mt-2 text-heading-s font-semibold text-deep-blue">{{ item.title }}</h3>
          <ContentValue :value="item.text" as="p" class="mt-2 text-text-secondary" />
        </li>
      </ul>
    </section>

    <!-- 3. Señales que requieren valoración -->
    <section class="bg-surface py-(--space-section)" aria-labelledby="diab-signs">
      <div class="container-site grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-5">
          <SectionHeading
            id="diab-signs"
            :title="{ before: 'Señales que requieren ', accent: 'valoración', after: '' }"
          />
        </div>
        <div class="lg:col-span-6 lg:col-start-7">
          <ul class="grid gap-4" role="list">
            <li
              v-for="(sign, i) in diabetic.signs"
              :key="i"
              v-reveal="i"
              class="flex gap-4 rounded-m bg-white p-5"
            >
              <BaseIcon name="alert" class="mt-0.5 size-6 text-primary-strong" />
              <ContentValue :value="sign" as="p" class="text-text" />
            </li>
          </ul>
          <div v-reveal class="urgent mt-8 flex gap-4 rounded-m p-6" role="note">
            <BaseIcon name="info" class="mt-0.5 size-6" />
            <p class="font-semibold">
              <span class="sr-only">Importante: </span>
              <ContentValue :value="diabetic.urgentNotice" />
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Recomendaciones generales -->
    <section class="container-site py-(--space-section)" aria-labelledby="diab-recs">
      <SectionHeading
        id="diab-recs"
        :title="{ before: 'Recomendaciones ', accent: 'generales', after: '' }"
      />
      <ol class="mt-10 grid gap-x-10 gap-y-6 md:grid-cols-2">
        <li
          v-for="(rec, i) in diabetic.recommendations"
          :key="i"
          v-reveal="i"
          class="flex gap-4 border-t border-border pt-5"
        >
          <span class="font-display text-heading-s text-primary-strong" aria-hidden="true">0{{ i + 1 }}</span>
          <ContentValue :value="rec" as="p" class="text-body-l text-text" />
        </li>
      </ol>
      <ContentValue
        :value="diabetic.disclaimer"
        as="p"
        class="mt-10 max-w-[60ch] text-sm text-text-secondary italic"
      />
    </section>

    <RelatedServices :slugs="service.related" />
  </div>
</template>

<style scoped>
.urgent {
  border-left: 4px solid var(--color-primary-strong);
  background: var(--color-light-blue);
  color: var(--color-deep-blue);
}
</style>
