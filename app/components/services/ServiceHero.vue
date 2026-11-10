<script setup lang="ts">
/**
 * Hero de página de servicio (spec 04): migas, eyebrow con el número, H1 con palabra destacada, descripción
 * (`pending`), CTA a pedir cita con el motivo preseleccionado y un visual en el slot.
 * `tone`: `soft` (infantil, más ice-blue) o `sober` (pie diabético, sin atmósfera de degradado).
 */
import type { Maybe } from '#shared/utils/pending'
import type { Headline } from '#shared/types/content'
import { bookingPath, type Service } from '~/data/services'

withDefaults(
  defineProps<{
    service: Service
    title: Headline
    description: Maybe<string>
    ctaLabel?: string
    tone?: 'default' | 'soft' | 'sober'
  }>(),
  { ctaLabel: 'Pedir cita', tone: 'default' },
)
defineSlots<{ default?: () => unknown; caption?: () => unknown }>()
</script>

<template>
  <section class="section-clip relative isolate" :class="`tone-${tone}`" aria-labelledby="service-title">
    <div
      v-if="tone !== 'sober'"
      class="atmosphere pointer-events-none absolute inset-0 -z-10"
      aria-hidden="true"
    />
    <div class="container-site pt-8 lg:pt-10">
      <SiteBreadcrumbs
        :items="[
          { name: 'Inicio', to: '/' },
          { name: 'Servicios', to: '/servicios' },
          { name: service.name },
        ]"
      />
    </div>
    <div class="container-site grid gap-10 pt-10 pb-16 lg:grid-cols-12 lg:items-center lg:pt-12 lg:pb-24">
      <div class="lg:col-span-6">
        <p class="eyebrow text-primary-strong">Servicios · {{ service.number }}</p>
        <h1 id="service-title" class="mt-4 font-display text-display-l text-deep-blue">
          {{ title.before }}<em v-if="title.accent" class="text-primary">{{ title.accent }}</em
          >{{ title.after ?? '' }}
        </h1>
        <ContentValue :value="description" as="p" class="mt-6 max-w-[46ch] text-body-l text-text-secondary" />
        <div class="mt-8 flex flex-wrap gap-3">
          <BaseButton :to="bookingPath(service.slug)" arrow>{{ ctaLabel }}</BaseButton>
        </div>
      </div>
      <figure v-if="$slots.default" class="lg:col-span-5 lg:col-start-8">
        <slot />
        <figcaption v-if="$slots.caption" class="mt-3 text-center text-xs text-text-secondary">
          <slot name="caption" />
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.atmosphere {
  background: var(--grad-atmosphere);
}
.tone-soft .atmosphere {
  background:
    radial-gradient(55% 55% at 75% 45%, rgb(185 229 243 / 0.75), transparent 72%),
    radial-gradient(40% 40% at 10% 90%, rgb(185 229 243 / 0.45), transparent 70%);
}
.tone-sober {
  background: var(--color-white);
}
</style>
