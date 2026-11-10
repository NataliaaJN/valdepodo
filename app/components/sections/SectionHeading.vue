<script setup lang="ts">
/**
 * Encabezado de sección (plan §2.3): eyebrow + titular con palabra destacada + intro opcional.
 */
import type { Maybe } from '#shared/utils/pending'
import type { Headline } from '#shared/types/content'

withDefaults(
  defineProps<{
    title: Headline
    eyebrow?: string
    intro?: Maybe<string>
    id?: string
    level?: 'h1' | 'h2'
    size?: 'l' | 'm'
    center?: boolean
  }>(),
  { eyebrow: undefined, intro: undefined, id: undefined, level: 'h2', size: 'm', center: false },
)
</script>

<template>
  <div :class="center ? 'mx-auto text-center' : ''">
    <p v-if="eyebrow" v-reveal class="eyebrow text-primary-strong">{{ eyebrow }}</p>
    <component
      :is="level"
      :id="id"
      v-reveal
      class="font-display text-deep-blue"
      :class="[
        size === 'l' ? 'text-display-l' : 'text-display-m',
        eyebrow ? 'mt-4' : '',
        center ? 'mx-auto max-w-[20ch]' : 'max-w-[22ch]',
      ]"
    >
      {{ title.before }}<em v-if="title.accent" class="text-primary">{{ title.accent }}</em
      >{{ title.after ?? '' }}
    </component>
    <ContentValue
      v-if="intro"
      v-reveal="1"
      :value="intro"
      as="p"
      class="measure mt-6 text-body-l text-text-secondary"
      :class="center ? 'mx-auto' : ''"
    />
  </div>
</template>
