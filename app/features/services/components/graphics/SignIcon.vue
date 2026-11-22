<script setup lang="ts">
/**
 * Iconos lineales de las señales de alerta del pie diabético: herida, temperatura, sensibilidad e hinchazón.
 * Trazo currentColor, esquemáticos y decorativos (aria-hidden).
 */
export type SignIconKind = 'wound' | 'temperature' | 'tingle' | 'swelling'

defineProps<{ kind: SignIconKind }>()
</script>

<template>
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- Herida: gota sobre la piel -->
    <template v-if="kind === 'wound'">
      <path d="M24 7c6 8 10 13 10 19a10 10 0 0 1-20 0c0-6 4-11 10-19Z" />
      <path d="M8 41h32" />
      <path d="M20 27a4 4 0 0 0 4 4" />
    </template>
    <!-- Color o temperatura: termómetro -->
    <template v-else-if="kind === 'temperature'">
      <path d="M20 29V10a4 4 0 0 1 8 0v19a8 8 0 1 1-8 0Z" />
      <path d="M24 20v13" />
      <circle cx="24" cy="35" r="2.5" />
      <path d="M33 12h6M33 19h4" />
    </template>
    <!-- Sensibilidad: hormigueo sobre el pie -->
    <template v-else-if="kind === 'tingle'">
      <path d="M13 40c-3-8-3-16 1-24 3-6 13-6 16 0 3 6 3 12 4 18 .5 4-2 6-6 6Z" />
      <path d="M38 9l-3 4M42 17l-4 1M40 25l-4-1" />
    </template>
    <!-- Hinchazón: tobillo con contorno ampliado -->
    <template v-else>
      <path d="M18 6v18c0 5-6 6-8 12-1 4 2 6 6 6h18c5 0 8-3 7-8-1-6-9-7-9-13V6" />
      <path d="M12 20c-4 4-4 10 0 14M36 20c4 4 4 10 0 14" stroke-dasharray="2 4" />
    </template>
  </svg>
</template>
