<script setup lang="ts">
/**
 * Encabezado de sección: etiqueta + titular de display + entradilla opcional. El titular es texto plano:
 * el antiguo énfasis en cursiva de color se retira (Bricolage no tiene cursiva y la fórmula se repetía).
 */
import type { Maybe } from '#shared/utils/pending'
import type { Headline } from '#shared/types/content'

const props = withDefaults(
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

const text = computed(() => `${props.title.before}${props.title.accent ?? ''}${props.title.after ?? ''}`)
</script>

<template>
  <div :class="center ? 'mx-auto text-center' : ''">
    <p v-if="eyebrow" v-reveal class="eyebrow text-primary-strong">{{ eyebrow }}</p>
    <component
      :is="level"
      :id="id"
      v-reveal
      class="text-ink"
      :class="[
        size === 'l' ? 'text-display-l' : 'text-display-m',
        eyebrow ? 'mt-4' : '',
        center ? 'mx-auto max-w-[20ch]' : 'max-w-[22ch]',
      ]"
    >
      {{ text }}
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
