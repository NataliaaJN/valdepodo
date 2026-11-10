<script setup lang="ts">
/**
 * Horario (spec 07 §2): días agrupados y franjas, indicando "Cerrado". Estado "Abierto ahora / Cerrado"
 * calculado en cliente con la zona Europe/Madrid, **solo si el horario está confirmado** (sin `pending`).
 */
import { isPending, resolveValue } from '#shared/utils/pending'
import { site } from '~/data/site'
import { DAY_NAMES, groupHours, openStatus, type OpenStatus } from '~/utils/clinic'

const hours = resolveValue(site.hours)
const rows = groupHours(hours)
const confirmed = !isPending(site.hours)
const pendingNote = isPending(site.hours) ? site.hours.note : undefined
const status = ref<OpenStatus | null>(null)

onMounted(() => {
  if (confirmed) status.value = openStatus(hours)
})
</script>

<template>
  <div>
    <p v-if="status" class="status" :class="status.open ? 'is-open' : 'is-closed'">
      <span class="status-dot" aria-hidden="true" />
      {{ status.open ? 'Abierto ahora' : 'Cerrado ahora' }}
      <span v-if="status.next" class="font-normal text-text-secondary">
        · {{ status.open ? 'cierra a las' : `abre ${DAY_NAMES[status.next.day]?.toLowerCase()} a las` }}
        {{ status.next.time }}
      </span>
    </p>
    <PendingBadge v-if="!confirmed" label="Horario por confirmar" :note="pendingNote" />
    <dl class="mt-3">
      <div v-for="row in rows" :key="row.label" class="hours-row">
        <dt class="font-semibold text-deep-blue">{{ row.label }}</dt>
        <dd class="text-text-secondary">
          <template v-if="row.slots.length">
            <span v-for="(s, i) in row.slots" :key="i" class="block">{{ s.open }} – {{ s.close }}</span>
          </template>
          <template v-else>Cerrado</template>
        </dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.hours-row {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  padding-block: 0.6rem;
}
.hours-row dd {
  text-align: right;
}
.status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}
.is-open {
  color: var(--color-success);
}
.is-open .status-dot {
  background: var(--color-success);
}
.is-closed {
  color: var(--color-text-secondary);
}
.is-closed .status-dot {
  background: var(--color-border-strong);
}
</style>
