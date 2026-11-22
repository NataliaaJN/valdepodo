<script setup lang="ts">
/**
 * Sistema de diseño (spec 01 §9). Solo desarrollo / previews: paleta con ratios de contraste, escala
 * tipográfica, botones en todos sus estados, campos, option cards, glass, degradados, iconos, biblioteca
 * SVG y demo de `reveal`. Los ratios se calculan aquí con la fórmula de WCAG 2.2.
 */
import type { IconName } from '~/components/ui/BaseIcon.vue'

useSeoMeta({ title: 'Sistema de diseño', robots: 'noindex, nofollow' })

const palette = [
  { token: 'primary', hex: '#1270b6' },
  { token: 'primary-strong', hex: '#0b5e99' },
  { token: 'cyan', hex: '#1eabe1' },
  { token: 'cyan-ink', hex: '#007e9e' },
  { token: 'deep-blue', hex: '#163c63' },
  { token: 'ice-blue', hex: '#b9e5f3' },
  { token: 'light-blue', hex: '#eaf5fa' },
  { token: 'surface', hex: '#f5f8fc' },
  { token: 'text', hex: '#24364b' },
  { token: 'text-secondary', hex: '#617386' },
  { token: 'border', hex: '#dce8ef' },
  { token: 'border-strong', hex: '#7a8fa3' },
  { token: 'error', hex: '#b42335' },
  { token: 'success', hex: '#1f7a5a' },
]

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}
function contrast(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1! + 0.05) / (l2! + 0.05)
}
const verdict = (ratio: number) => (ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA grande / UI' : 'No texto')

const typeScale = [
  { token: 'display-xl', cls: 'font-display text-display-xl', sample: 'Todo empieza' },
  { token: 'display-l', cls: 'font-display text-display-l', sample: 'Soluciones para tus pies' },
  { token: 'display-m', cls: 'font-display text-display-m', sample: 'Cada paso cuenta' },
  { token: 'heading-s', cls: 'text-heading-s font-semibold', sample: 'Estudio biomecánico' },
  { token: 'body-l', cls: 'text-body-l', sample: 'Analizamos cómo apoyas y cómo te mueves.' },
  { token: 'body', cls: 'text-body', sample: 'Texto de párrafo con medida máxima de 62 caracteres.' },
  { token: 'small', cls: 'text-small', sample: 'Metadatos y pies de foto' },
  { token: 'eyebrow', cls: 'eyebrow', sample: 'Etiqueta de sección' },
  { token: 'numeral', cls: 'font-display text-numeral', sample: '9' },
]

const icons: IconName[] = [
  'arrow-right',
  'arrow-left',
  'arrow-up-right',
  'phone',
  'mail',
  'instagram',
  'linkedin',
  'map-pin',
  'clock',
  'close',
  'plus',
  'check',
  'alert',
  'info',
  'copy',
  'route',
]

const option = ref<string | null>('b')
const checked = ref(true)
const loading = ref(false)
</script>

<template>
  <div class="container-site grid gap-20 py-16">
    <header>
      <p class="eyebrow text-primary-strong">Solo desarrollo · spec 01</p>
      <h1 class="mt-3 font-display text-display-l text-deep-blue">Sistema de <em>diseño</em></h1>
    </header>

    <section aria-labelledby="s-color">
      <h2 id="s-color" class="font-display text-display-m text-deep-blue">Color y contraste</h2>
      <ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
        <li
          v-for="c in palette"
          :key="c.token"
          class="overflow-hidden rounded-m border border-border bg-white"
        >
          <div class="h-20" :style="{ background: c.hex }" />
          <div class="p-4 text-sm">
            <p class="font-semibold text-deep-blue">{{ c.token }}</p>
            <p class="text-text-secondary">{{ c.hex }}</p>
            <p class="mt-2">
              Sobre blanco: <strong>{{ contrast(c.hex, '#ffffff').toFixed(2) }}</strong>
              <span class="text-text-secondary"> · {{ verdict(contrast(c.hex, '#ffffff')) }}</span>
            </p>
            <p>
              Sobre deep-blue: <strong>{{ contrast(c.hex, '#163c63').toFixed(2) }}</strong>
            </p>
          </div>
        </li>
      </ul>
      <div class="mt-8 grid gap-4 md:grid-cols-4">
        <div class="h-28 rounded-l bg-(image:--grad-atmosphere) p-4 text-sm">--grad-atmosphere</div>
        <div class="h-28 rounded-l bg-(image:--grad-mist) p-4 text-sm">--grad-mist</div>
        <div class="h-28 rounded-l bg-(image:--grad-brand) p-4 text-sm text-white">
          --grad-brand (sin texto encima)
        </div>
        <div class="h-28 rounded-l bg-(image:--grad-glass) p-4 text-sm">--grad-glass</div>
      </div>
    </section>

    <section aria-labelledby="s-type">
      <h2 id="s-type" class="font-display text-display-m text-deep-blue">Tipografía</h2>
      <ul class="mt-8 grid gap-6" role="list">
        <li
          v-for="t in typeScale"
          :key="t.token"
          class="grid gap-2 border-b border-border pb-6 md:grid-cols-[10rem_1fr]"
        >
          <span class="text-sm text-text-secondary">{{ t.token }}</span>
          <span :class="t.cls" class="text-deep-blue">{{ t.sample }}</span>
        </li>
      </ul>
    </section>

    <section aria-labelledby="s-buttons">
      <h2 id="s-buttons" class="font-display text-display-m text-deep-blue">Botones</h2>
      <div class="mt-8 flex flex-wrap items-center gap-4">
        <BaseButton arrow>Primario</BaseButton>
        <BaseButton variant="secondary">Secundario</BaseButton>
        <BaseButton variant="ghost">Enlace</BaseButton>
        <BaseButton size="sm">Compacto</BaseButton>
        <BaseButton disabled>Desactivado</BaseButton>
        <BaseButton :loading="loading" @click="loading = !loading">Cargando (clic)</BaseButton>
      </div>
      <div class="mt-6 flex flex-wrap gap-4 rounded-l bg-deep-blue p-6">
        <BaseButton variant="on-dark" arrow>Sobre deep-blue</BaseButton>
      </div>
    </section>

    <section aria-labelledby="s-forms" class="max-w-[720px]">
      <h2 id="s-forms" class="font-display text-display-m text-deep-blue">Formularios</h2>
      <div class="mt-8 grid gap-6">
        <FormField id="demo-name" label="Nombre y apellidos" hint="Texto de ayuda opcional.">
          <template #default="{ id, describedBy }">
            <input :id="id" class="text-input" :aria-describedby="describedBy" />
          </template>
        </FormField>
        <FormField
          id="demo-error"
          label="Email"
          error="Escribe un email válido, por ejemplo nombre@correo.com."
        >
          <template #default="{ id, describedBy, invalid }">
            <input
              :id="id"
              class="text-input"
              value="nombre@"
              :aria-describedby="describedBy"
              :aria-invalid="invalid"
            />
          </template>
        </FormField>
        <fieldset>
          <legend class="font-semibold text-deep-blue">Option cards</legend>
          <div class="mt-3 grid gap-3 sm:grid-cols-3">
            <OptionCard v-model="option" name="demo" value="a" label="Mañana" />
            <OptionCard v-model="option" name="demo" value="b" label="Tarde" />
            <OptionCard v-model="option" name="demo" value="c" label="Indiferente" />
          </div>
        </fieldset>
        <CheckboxField id="demo-check" v-model="checked">Acepto la política de privacidad.</CheckboxField>
      </div>
    </section>

    <section aria-labelledby="s-glass">
      <h2 id="s-glass" class="font-display text-display-m text-deep-blue">Superficies y radios</h2>
      <div
        class="relative mt-8 grid gap-6 overflow-hidden rounded-l bg-(image:--grad-brand) p-8 md:grid-cols-3"
      >
        <div class="glass rounded-l p-6">Glass (radius-l)</div>
        <div class="rounded-m bg-white p-6 shadow-soft">shadow-soft (radius-m)</div>
        <div class="rounded-s bg-white p-6 shadow-float">shadow-float (radius-s)</div>
      </div>
      <div class="mt-6 h-40 w-56 rounded-[var(--radius-organic)] bg-light-blue" />
    </section>

    <section aria-labelledby="s-icons">
      <h2 id="s-icons" class="font-display text-display-m text-deep-blue">Iconos utilitarios</h2>
      <ul class="mt-8 grid grid-cols-4 gap-4 sm:grid-cols-8" role="list">
        <li
          v-for="name in icons"
          :key="name"
          class="grid place-items-center gap-2 rounded-m bg-white p-4 text-xs text-text-secondary"
        >
          <BaseIcon :name="name" class="size-6 text-primary" />
          {{ name }}
        </li>
      </ul>
    </section>

    <section aria-labelledby="s-svg">
      <h2 id="s-svg" class="font-display text-display-m text-deep-blue">Lenguaje gráfico</h2>
      <div class="mt-8 grid gap-6 md:grid-cols-3">
        <div class="rounded-l bg-white p-6" style="--fp-fill: var(--color-primary)">
          <FootprintTrail />
        </div>
        <div class="rounded-l bg-white p-6"><GrowingFootprints /></div>
        <div class="grid grid-cols-2 gap-4 rounded-l bg-white p-6">
          <TreatmentIllustration kind="ingrown" />
          <TreatmentIllustration kind="callus" />
        </div>
      </div>
    </section>

    <section aria-labelledby="s-reveal">
      <h2 id="s-reveal" class="font-display text-display-m text-deep-blue">Entrada `reveal`</h2>
      <div class="mt-8 grid gap-4 md:grid-cols-4">
        <div v-for="n in 8" :key="n" v-reveal="n % 4" class="h-24 rounded-m bg-light-blue" />
      </div>
    </section>
  </div>
</template>
