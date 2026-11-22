<script setup lang="ts">
/** Huellas que avanzan en la confirmación de la solicitud (spec 06 §2). Decorativo. */
</script>

<template>
  <div class="w-40" style="--fp-fill: var(--color-primary)" aria-hidden="true">
    <FootprintTrail
      :steps="4"
      :width="240"
      :height="90"
      :from="[10, 80]"
      :control="[120, 90]"
      :to="[230, 20]"
      :scale="0.12"
    />
  </div>
</template>
