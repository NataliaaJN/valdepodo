<script setup lang="ts">
/** Aviso legal (LSSI-CE). Borrador estructural en `pending()` hasta la revisión de la asesoría. */
import { controller, legalNotice } from '~/data/legal'

const clinic = useClinic()
</script>

<template>
  <LegalDocument :page="legalNotice" path="/aviso-legal">
    <template #before>
      <dl class="legal-data">
        <dt>Titular</dt>
        <dd><ContentValue :value="controller.name" /></dd>
        <dt>NIF/CIF</dt>
        <dd><ContentValue :value="controller.taxId" /></dd>
        <dt>Domicilio</dt>
        <dd>{{ clinic.addressLine }}</dd>
        <dt>Contacto</dt>
        <dd>
          <a :href="clinic.phoneHref">{{ clinic.phone }}</a> ·
          <a :href="clinic.mailHref">{{ clinic.email }}</a>
        </dd>
        <dt>Registro</dt>
        <dd><ContentValue :value="controller.registry" /></dd>
      </dl>
    </template>
  </LegalDocument>
</template>

<style scoped>
.legal-data {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: minmax(0, 8rem) minmax(0, 1fr);
  gap: 0.5rem 1.5rem;
  border-radius: var(--radius-m);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  padding: 1.25rem 1.5rem;
}
.legal-data dt {
  color: var(--color-text-secondary);
}
.legal-data dd {
  font-weight: 600;
  color: var(--color-deep-blue);
  overflow-wrap: anywhere;
}
</style>
