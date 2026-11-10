<script setup lang="ts">
/** Página de texto legal (aviso legal, privacidad, cookies): titular sobrio + secciones. */
import type { LegalPage } from '~/data/legal'

const props = defineProps<{ page: LegalPage; path: string }>()

usePageSeo({ title: props.page.title, description: props.page.description, path: props.path })
</script>

<template>
  <article class="container-site py-12 lg:py-20" aria-labelledby="legal-title">
    <p class="eyebrow text-primary-strong">Legal</p>
    <h1 id="legal-title" class="mt-4 font-display text-display-l text-deep-blue">{{ page.title }}</h1>
    <p class="mt-4 text-sm text-text-secondary">
      Última actualización: <ContentValue :value="page.updated" />
    </p>
    <PendingBadge
      class="mt-4"
      label="Texto provisional pendiente de la asesoría"
      note="Spec 06 §4 y spec 10 §7: textos legales revisados por asesoría"
    />
    <div class="prose-site">
      <slot name="before" />
      <section v-for="section in page.sections" :key="section.title">
        <h2>{{ section.title }}</h2>
        <ContentValue v-for="(paragraph, i) in section.paragraphs" :key="i" :value="paragraph" as="p" />
      </section>
      <slot />
    </div>
  </article>
</template>
