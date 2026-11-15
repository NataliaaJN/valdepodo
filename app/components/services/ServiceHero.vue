<script setup lang="ts">
/**
 * Cabecera común de las cinco páginas de servicio: la misma de «La clínica» y «Contacto» (`ClinicHero`).
 * Fotografía del servicio a sangre (de `app/data/service-media.ts`, único punto de sustitución), migas de pan
 * arriba, el NOMBRE del servicio como h1 abajo a la izquierda y, a la derecha, su descripción y la acción
 * principal. Todas las páginas de servicio abren igual: título = nombre del servicio, nada de frases con
 * palabra acentuada ni segunda «hoja» de presentación.
 */
import type { Maybe } from '#shared/utils/pending'
import { getServiceMedia } from '~/data/service-media'
import { bookingPath, type Service } from '~/data/services'

const props = withDefaults(
  defineProps<{
    service: Service
    description: Maybe<string>
    ctaLabel?: string
  }>(),
  { ctaLabel: 'Pedir cita' },
)

const media = computed(() => getServiceMedia(props.service.slug))
</script>

<template>
  <ClinicHero
    id="service-title"
    :title="service.name"
    :photo="{ src: media.src, alt: media.alt ?? '' }"
    :focus="media.focus"
  >
    <template #crumbs>
      <SiteBreadcrumbs
        :items="[
          { name: 'Inicio', to: '/' },
          { name: 'Servicios', to: '/servicios' },
          { name: service.name },
        ]"
      />
    </template>
    <ContentValue :value="description" as="p" />
    <BaseButton :to="bookingPath(service.slug)" variant="on-blue" arrow class="mt-6">
      {{ ctaLabel }}
    </BaseButton>
  </ClinicHero>
</template>
