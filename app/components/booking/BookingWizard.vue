<script setup lang="ts">
/**
 * Wizard de solicitud de cita (spec 06 §2). Es una SOLICITUD: nunca se habla de cita confirmada.
 *
 * - 5 pasos: motivo · primera visita · preferencia horaria · datos · resumen.
 * - Cada paso se refleja en `?paso=n` con `router.push`: el botón atrás del navegador retrocede de paso.
 *   Entrar en un paso posterior sin datos válidos redirige al primer paso incompleto.
 * - `?motivo=` preselecciona el motivo sin saltar el paso.
 * - Elegir una opción no avanza sola: botón "Continuar". Validación al continuar y luego en `blur`.
 * - Al cambiar de paso, el foco va al encabezado; el progreso se anuncia (`aria-live`).
 * - Borrador en sessionStorage sin consentimientos (`useBookingDraft`), borrado tras el envío correcto.
 * - La confirmación solo se muestra tras una respuesta real del servidor `{ ok: true, id }`.
 *
 * El paso se lee de la URL al montar (no en SSR): la página se prerenderiza sin query y así no hay
 * diferencias de hidratación.
 */
import {
  REASON_LABELS,
  SLOT_LABELS,
  isBookingReason,
  preferredDateRange,
  type BookingReason,
  type BookingResponse,
  type BookingSuccess,
  type TimeSlot,
} from '#shared/schemas/booking'
import { site } from '~/data/site'
import { services } from '~/data/services'
import {
  STEP_TITLES,
  TOTAL_STEPS,
  earliestStep,
  failureMessage,
  firstIncompleteStep,
  toFieldErrors,
  validateStep,
  type FieldErrors,
  type SubmitFailure,
  type WizardValues,
} from '~/utils/booking'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const clinic = useClinic()
const { draft, load, save, clear } = useBookingDraft()

const consents = reactive({ privacidad: false, comunicaciones: false })
const step = ref(1)
const errors = ref<FieldErrors>({})
const attempted = ref(new Set<number>())
const status = ref<'idle' | 'sending' | 'success'>('idle')
const failure = ref<SubmitFailure | null>(null)
const success = ref<(BookingSuccess & { summary: { label: string; value: string }[] }) | null>(null)
const formToken = ref('')
const tokenFailed = ref(false)
const turnstileToken = ref('')
const honeypot = ref('')
const dateRange = ref({ min: '', max: '' })

const heading = ref<HTMLElement | null>(null)
const errorSummary = ref<HTMLElement | null>(null)
const turnstile = ref<{ reset: () => void } | null>(null)

const siteKey = config.public.turnstileSiteKey
const sending = computed(() => status.value === 'sending')

const values = computed<WizardValues>(() => ({
  motivo: draft.motivo,
  primeraVisita: draft.primeraVisita,
  franja: draft.franja,
  fechaPreferida: draft.fechaPreferida,
  nombre: draft.nombre,
  telefono: draft.telefono,
  email: draft.email,
  privacidad: consents.privacidad ? true : null,
  comunicaciones: consents.comunicaciones,
}))

/* ---------- Opciones ---------- */
const reasonOptions = [
  ...services.map((s) => ({ value: s.slug as BookingReason, label: s.name })),
  { value: 'otra' as BookingReason, label: REASON_LABELS.otra },
]
const visitOptions = [
  { value: true, label: 'Sí', description: 'Es la primera vez que vengo a Valdepodo' },
  { value: false, label: 'No', description: 'Ya he venido antes' },
]
const slotOptions = (['manana', 'tarde', 'indiferente'] as TimeSlot[]).map((v) => ({
  value: v,
  label: SLOT_LABELS[v],
}))

/* ---------- Navegación entre pasos ---------- */
let focusOnEnter = false

function stepFromQuery(): number {
  const n = Number(route.query.paso)
  return Number.isInteger(n) && n >= 1 && n <= TOTAL_STEPS ? n : 1
}

function goTo(n: number) {
  router.push({ query: { ...route.query, paso: String(n) } })
}

async function applyStep(requested: number) {
  if (status.value === 'success') return
  const allowed = firstIncompleteStep(values.value)
  if (requested > allowed) {
    await router.replace({ query: { ...route.query, paso: String(allowed) } })
    return
  }
  if (requested !== step.value) {
    // Los errores del servidor se conservan al volver al paso afectado
    if (failure.value !== 'validation') errors.value = {}
    focusOnEnter = true
    step.value = requested
  }
}

/* El paso nuevo se monta al terminar la salida del anterior (mode="out-in"): el foco va en after-enter */
function onStepEnter() {
  if (!focusOnEnter) return
  focusOnEnter = false
  heading.value?.focus()
}

watch(
  () => route.query.paso,
  () => applyStep(stepFromQuery()),
)

function next() {
  const stepErrors = validateStep(step.value, values.value)
  attempted.value = new Set([...attempted.value, step.value])
  errors.value = stepErrors
  failure.value = null
  if (Object.keys(stepErrors).length) {
    nextTick(() => errorSummary.value?.focus())
    return
  }
  save()
  goTo(step.value + 1)
}

function back() {
  goTo(step.value - 1)
}

/** Validación en `blur` una vez que se ha intentado continuar en el paso. */
function onBlur(field: keyof FieldErrors) {
  if (!attempted.value.has(step.value)) return
  const stepErrors = validateStep(step.value, values.value)
  errors.value = { ...errors.value, [field]: stepErrors[field] }
}

/* Al elegir una opción, se limpia su error (sin avanzar) */
watch(
  () => [draft.motivo, draft.primeraVisita, draft.franja, consents.privacidad],
  () => {
    if (!attempted.value.has(step.value)) return
    const stepErrors = validateStep(step.value, values.value)
    const next: FieldErrors = { ...errors.value }
    for (const key of ['motivo', 'primeraVisita', 'franja', 'privacidad'] as const) {
      if (!stepErrors[key]) next[key] = undefined
    }
    errors.value = next
  },
)

watch(draft, save, { deep: true })

const errorList = computed(() =>
  (Object.entries(errors.value) as [keyof FieldErrors, string | undefined][]).filter(
    (e): e is [keyof FieldErrors, string] => Boolean(e[1]),
  ),
)

/* ---------- Envío ---------- */
async function fetchFormToken() {
  try {
    const res = await $fetch<{ token: string }>('/api/cita/token', { timeout: 10_000 })
    formToken.value = res.token
    tokenFailed.value = false
  } catch {
    tokenFailed.value = true
  }
}

const summary = computed(() => [
  { step: 1, label: 'Motivo', value: draft.motivo ? REASON_LABELS[draft.motivo] : '' },
  {
    step: 2,
    label: 'Primera visita',
    value: draft.primeraVisita === null ? '' : draft.primeraVisita ? 'Sí' : 'No',
  },
  { step: 3, label: 'Preferencia horaria', value: draft.franja ? SLOT_LABELS[draft.franja] : '' },
  {
    step: 3,
    label: 'Fecha orientativa',
    value: draft.fechaPreferida ? formatDate(draft.fechaPreferida) : 'Sin preferencia',
  },
  { step: 4, label: 'Nombre', value: draft.nombre },
  { step: 4, label: 'Teléfono', value: draft.telefono },
  { step: 4, label: 'Email', value: draft.email },
])

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

async function submit() {
  const firstBad = firstIncompleteStep(values.value)
  if (firstBad < TOTAL_STEPS) {
    errors.value = validateStep(firstBad, values.value)
    attempted.value = new Set([...attempted.value, firstBad])
    goTo(firstBad)
    return
  }
  if (siteKey && !turnstileToken.value) {
    failure.value = 'antispam'
    return
  }
  if (!formToken.value) await fetchFormToken()

  status.value = 'sending'
  failure.value = null
  try {
    const res = await $fetch.raw<BookingResponse>('/api/cita', {
      method: 'POST',
      body: {
        motivo: draft.motivo,
        primeraVisita: draft.primeraVisita,
        franja: draft.franja,
        fechaPreferida: draft.fechaPreferida || undefined,
        nombre: draft.nombre,
        telefono: draft.telefono,
        email: draft.email,
        privacidad: consents.privacidad,
        comunicaciones: consents.comunicaciones,
        turnstileToken: turnstileToken.value,
        formToken: formToken.value,
        website: honeypot.value,
      },
      timeout: 15_000,
      ignoreResponseError: true,
    })
    const body = res._data
    if (res.status === 200 && body?.ok) {
      success.value = { ...body, summary: summary.value.map(({ label, value }) => ({ label, value })) }
      status.value = 'success'
      clear()
      consents.privacidad = false
      consents.comunicaciones = false
      await router.replace({ query: {} })
      await nextTick()
      heading.value?.focus()
      return
    }
    status.value = 'idle'
    const code = body && !body.ok ? body.error : 'delivery'
    failure.value = code
    if (code === 'validation' && body && !body.ok && body.issues) {
      errors.value = toFieldErrors(body.issues)
      const target = earliestStep(errors.value)
      if (target < TOTAL_STEPS) goTo(target)
    }
    if (code === 'antispam' || code === 'forbidden') {
      turnstile.value?.reset()
      await fetchFormToken()
    }
  } catch {
    status.value = 'idle'
    failure.value = 'network'
  }
}

const failureInfo = computed(() => {
  if (!failure.value || failure.value === 'validation') return null
  const { title, text } = failureMessage(failure.value)
  return { title, text: text.replace('{tel}', clinic.phone) }
})

/* ---------- Montaje ---------- */
onMounted(async () => {
  load()
  const motivo = route.query.motivo
  if (isBookingReason(motivo)) draft.motivo = motivo
  dateRange.value = preferredDateRange()
  await applyStep(stepFromQuery())
  fetchFormToken()
})
</script>

<template>
  <div class="booking-wizard">
    <!-- Confirmación: solo tras respuesta real del servidor -->
    <section v-if="status === 'success' && success" class="wizard-card" aria-labelledby="booking-done">
      <BookingSuccessArt />
      <h2
        id="booking-done"
        ref="heading"
        tabindex="-1"
        class="mt-6 font-display text-display-m text-deep-blue"
      >
        Hemos recibido tu <em>solicitud</em>.
      </h2>
      <p class="mt-4 text-body-l text-text-secondary">
        Te contactaremos en <ContentValue :value="site.responseTime" /> para confirmar el día y la hora.
        Todavía no es una cita confirmada.
      </p>
      <p class="mt-6 rounded-m bg-light-blue px-5 py-4 text-deep-blue">
        Referencia: <strong class="font-semibold">{{ success.id }}</strong>
      </p>
      <p v-if="!success.acknowledged" class="mt-3 text-sm text-text-secondary">
        No hemos podido enviarte el correo de acuse, pero la clínica ha recibido tu solicitud.
      </p>
      <dl class="summary mt-6">
        <div v-for="row in success.summary" :key="row.label" class="summary-row">
          <dt>{{ row.label }}</dt>
          <dd>{{ row.value }}</dd>
        </div>
      </dl>
      <div class="mt-8 flex flex-wrap gap-3">
        <BaseButton to="/" arrow>Volver al inicio</BaseButton>
        <BaseButton to="/servicios" variant="secondary">Ver servicios</BaseButton>
      </div>
    </section>

    <form
      v-else
      class="wizard-card"
      novalidate
      :aria-busy="sending"
      @submit.prevent="step === TOTAL_STEPS ? submit() : next()"
    >
      <BookingProgress :step="step" :total="TOTAL_STEPS" :title="STEP_TITLES[step - 1]!" />

      <!-- Honeypot: invisible para personas, rellenado por bots -->
      <div class="hp" aria-hidden="true">
        <label for="booking-website">No rellenes este campo</label>
        <input
          id="booking-website"
          v-model="honeypot"
          type="text"
          name="website"
          tabindex="-1"
          autocomplete="off"
        />
      </div>

      <div
        v-if="errorList.length"
        ref="errorSummary"
        class="error-summary mt-6"
        role="alert"
        tabindex="-1"
        aria-labelledby="error-summary-title"
      >
        <p id="error-summary-title" class="font-semibold">
          Revisa {{ errorList.length > 1 ? 'estos campos' : 'este campo' }}:
        </p>
        <ul class="mt-2 grid gap-1">
          <li v-for="[field, message] in errorList" :key="field">
            <a :href="`#field-${field}`" class="underline underline-offset-4">{{ message }}</a>
          </li>
        </ul>
      </div>

      <Transition name="step" mode="out-in" @after-enter="onStepEnter">
        <!-- 01 Motivo -->
        <fieldset
          v-if="step === 1"
          id="field-motivo"
          key="1"
          class="step"
          tabindex="-1"
          aria-labelledby="step-title-1"
          :disabled="sending"
        >
          <h2 id="step-title-1" ref="heading" tabindex="-1" class="step-title">
            ¿Cuál es el motivo de tu consulta?
          </h2>
          <div class="options mt-6" :class="{ 'has-error': errors.motivo }">
            <OptionCard
              v-for="o in reasonOptions"
              :key="o.value"
              v-model="draft.motivo"
              name="motivo"
              :value="o.value"
              :label="o.label"
            />
          </div>
          <p v-if="errors.motivo" class="field-error mt-3">
            <BaseIcon name="alert" class="size-4" />{{ errors.motivo }}
          </p>
        </fieldset>

        <!-- 02 Primera visita -->
        <fieldset
          v-else-if="step === 2"
          id="field-primeraVisita"
          key="2"
          class="step"
          tabindex="-1"
          aria-labelledby="step-title-2"
          :disabled="sending"
        >
          <h2 id="step-title-2" ref="heading" tabindex="-1" class="step-title">¿Es tu primera visita?</h2>
          <div class="options options-2 mt-6">
            <OptionCard
              v-for="o in visitOptions"
              :key="String(o.value)"
              v-model="draft.primeraVisita"
              name="primeraVisita"
              :value="o.value"
              :label="o.label"
              :description="o.description"
            />
          </div>
          <p v-if="errors.primeraVisita" class="field-error mt-3">
            <BaseIcon name="alert" class="size-4" />{{ errors.primeraVisita }}
          </p>
        </fieldset>

        <!-- 03 Preferencia horaria -->
        <div v-else-if="step === 3" key="3" class="step">
          <h2 ref="heading" tabindex="-1" class="step-title">¿Cuándo te viene mejor?</h2>
          <fieldset id="field-franja" class="mt-6" tabindex="-1" :disabled="sending">
            <legend class="font-semibold text-deep-blue">Preferencia horaria</legend>
            <div class="options options-3 mt-3">
              <OptionCard
                v-for="o in slotOptions"
                :key="o.value"
                v-model="draft.franja"
                name="franja"
                :value="o.value"
                :label="o.label"
              />
            </div>
            <p v-if="errors.franja" class="field-error mt-3">
              <BaseIcon name="alert" class="size-4" />{{ errors.franja }}
            </p>
          </fieldset>
          <FormField
            id="field-fechaPreferida"
            class="mt-8"
            label="Fecha que prefieres"
            hint="Preferencia orientativa, no reserva. Te confirmaremos el día al contactarte."
            optional
            :error="errors.fechaPreferida"
          >
            <template #default="{ id, describedBy, invalid }">
              <input
                :id="id"
                v-model="draft.fechaPreferida"
                type="date"
                class="text-input sm:max-w-[16rem]"
                :min="dateRange.min || undefined"
                :max="dateRange.max || undefined"
                :aria-describedby="describedBy"
                :aria-invalid="invalid ? 'true' : undefined"
                :disabled="sending"
                @blur="onBlur('fechaPreferida')"
              />
            </template>
          </FormField>
        </div>

        <!-- 04 Datos -->
        <div v-else-if="step === 4" key="4" class="step">
          <h2 ref="heading" tabindex="-1" class="step-title">Tus datos de contacto</h2>
          <p class="mt-2 text-text-secondary">Solo los usaremos para contactarte y confirmar la cita.</p>
          <div class="mt-6 grid gap-6">
            <FormField id="field-nombre" label="Nombre y apellidos" :error="errors.nombre">
              <template #default="{ id, describedBy, invalid }">
                <input
                  :id="id"
                  v-model="draft.nombre"
                  type="text"
                  class="text-input"
                  autocomplete="name"
                  maxlength="80"
                  :aria-describedby="describedBy"
                  :aria-invalid="invalid ? 'true' : undefined"
                  :disabled="sending"
                  @blur="onBlur('nombre')"
                />
              </template>
            </FormField>
            <div class="grid gap-6 sm:grid-cols-2">
              <FormField id="field-telefono" label="Teléfono" :error="errors.telefono">
                <template #default="{ id, describedBy, invalid }">
                  <input
                    :id="id"
                    v-model="draft.telefono"
                    type="tel"
                    inputmode="tel"
                    class="text-input"
                    autocomplete="tel"
                    maxlength="30"
                    :aria-describedby="describedBy"
                    :aria-invalid="invalid ? 'true' : undefined"
                    :disabled="sending"
                    @blur="onBlur('telefono')"
                  />
                </template>
              </FormField>
              <FormField id="field-email" label="Email" :error="errors.email">
                <template #default="{ id, describedBy, invalid }">
                  <input
                    :id="id"
                    v-model="draft.email"
                    type="email"
                    class="text-input"
                    autocomplete="email"
                    maxlength="120"
                    :aria-describedby="describedBy"
                    :aria-invalid="invalid ? 'true' : undefined"
                    :disabled="sending"
                    @blur="onBlur('email')"
                  />
                </template>
              </FormField>
            </div>
            <CheckboxField
              id="field-privacidad"
              v-model="consents.privacidad"
              :error="errors.privacidad"
              :disabled="sending"
            >
              He leído y acepto la
              <NuxtLink
                to="/privacidad"
                target="_blank"
                class="font-semibold text-primary-strong underline underline-offset-4"
                >política de privacidad<span class="sr-only"> (se abre en una pestaña nueva)</span></NuxtLink
              >.
            </CheckboxField>
            <CheckboxField id="field-comunicaciones" v-model="consents.comunicaciones" :disabled="sending">
              Quiero recibir comunicaciones de Valdepodo (opcional).
            </CheckboxField>
          </div>
        </div>

        <!-- 05 Resumen -->
        <div v-else key="5" class="step">
          <h2 ref="heading" tabindex="-1" class="step-title">Revisa tu solicitud</h2>
          <dl class="summary mt-6">
            <div v-for="row in summary" :key="row.label" class="summary-row">
              <dt>{{ row.label }}</dt>
              <dd>
                {{ row.value }}
                <button type="button" class="change-link" :disabled="sending" @click="goTo(row.step)">
                  Cambiar<span class="sr-only"> {{ row.label.toLowerCase() }}</span>
                </button>
              </dd>
            </div>
          </dl>

          <TurnstileWidget
            v-if="siteKey"
            ref="turnstile"
            class="mt-6"
            :site-key="siteKey"
            @token="turnstileToken = $event"
          />

          <div v-if="failureInfo" class="failure mt-6" role="alert">
            <p class="font-semibold">{{ failureInfo.title }}</p>
            <p class="mt-1">{{ failureInfo.text }}</p>
            <p class="mt-2 flex flex-wrap gap-x-5 gap-y-1">
              <a :href="clinic.phoneHref" class="font-semibold underline underline-offset-4">Llamar</a>
              <a :href="clinic.mailHref" class="font-semibold underline underline-offset-4"
                >Escribir un email</a
              >
            </p>
          </div>
          <p v-if="tokenFailed" class="failure mt-6" role="alert">
            Ahora mismo no podemos recibir solicitudes online. Llámanos al {{ clinic.phone }}.
          </p>
        </div>
      </Transition>

      <div class="actions mt-10">
        <BaseButton v-if="step > 1" variant="secondary" :disabled="sending" @click="back">Volver</BaseButton>
        <BaseButton type="submit" :arrow="step < TOTAL_STEPS" :loading="sending" class="ml-auto">
          {{ step < TOTAL_STEPS ? 'Continuar' : 'Enviar solicitud' }}
        </BaseButton>
      </div>

      <!-- Capa informativa de privacidad (spec 06 §4; redacción final por asesoría) -->
      <p v-if="step === TOTAL_STEPS" class="legal-layer mt-6">
        <strong>Responsable:</strong> <ContentValue :value="site.legalName" />.
        <strong>Finalidad:</strong> gestionar tu solicitud de cita. <strong>Base jurídica:</strong> tu
        consentimiento. <strong>Destinatarios:</strong> el proveedor de correo, como encargado del
        tratamiento. <strong>Derechos:</strong> acceso, rectificación, supresión y otros, como se explica en
        la <NuxtLink to="/privacidad" class="underline underline-offset-4">política de privacidad</NuxtLink>.
        <PendingBadge
          label="Texto legal pendiente de asesoría"
          note="Capa informativa (spec 06 §4)"
          class="ml-1"
        />
      </p>
    </form>
  </div>
</template>

<style scoped>
.wizard-card {
  border-radius: var(--radius-l);
  border: 1px solid var(--color-border);
  background: var(--color-white);
  padding: clamp(1.25rem, 4vw, 2.5rem);
  box-shadow: var(--shadow-soft);
}
.step-title {
  margin-top: 1.5rem;
  font-family: var(--font-display);
  font-size: var(--text-display-m);
  line-height: var(--text-display-m--line-height);
  color: var(--color-deep-blue);
}
.step-title:focus-visible,
.error-summary:focus-visible,
fieldset:focus-visible {
  box-shadow: none;
  outline: 2px dashed var(--color-primary-strong);
  outline-offset: 4px;
}
.options {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.75rem;
}
@media (min-width: 481px) {
  .options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .options-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
.field-error {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-error);
}
.error-summary,
.failure {
  border-left: 4px solid var(--color-error);
  border-radius: var(--radius-s);
  background: rgb(180 35 53 / 0.06);
  padding: 1rem 1.25rem;
  color: var(--color-error);
}
.failure {
  color: var(--color-text);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.summary-row {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: 1rem;
  border-bottom: 1px solid var(--color-border);
  padding-block: 0.75rem;
}
.summary-row dt {
  color: var(--color-text-secondary);
}
.summary-row dd {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.25rem 1rem;
  font-weight: 600;
  color: var(--color-deep-blue);
  overflow-wrap: anywhere;
}
.change-link {
  min-height: 32px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary-strong);
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}
.legal-layer {
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-text-secondary);
}
.hp {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.step-enter-active,
.step-leave-active {
  transition:
    opacity 220ms var(--ease-out-soft),
    transform 220ms var(--ease-out-soft);
}
.step-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
@media (prefers-reduced-motion: reduce) {
  .step-enter-from,
  .step-leave-to {
    transform: none;
  }
}
</style>
