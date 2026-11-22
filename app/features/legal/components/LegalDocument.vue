<script setup lang="ts">
/** Página de texto legal (aviso legal, privacidad, cookies): misma cabecera que el resto + prosa sobre hueso. */
import type { LegalPage } from '~/features/legal/data/legal'

const props = defineProps<{ page: LegalPage; path: string }>()

usePageSeo({ title: props.page.title, description: props.page.description, path: props.path })
</script>

<template>
  <div>
    <PageHeader id="legal-title" :title="page.title" eyebrow="Legal">
      <span class="text-sm">Última actualización: <ContentValue :value="page.updated" /></span>
    </PageHeader>
    <article class="container-wide pb-(--space-section)" aria-labelledby="legal-title" data-nav-theme="bone">
      <div class="lg:grid lg:grid-cols-12 lg:gap-6">
        <div class="lg:col-span-8 lg:col-start-4">
          <PendingBadge
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
        </div>
      </div>
    </article>
  </div>
</template>
