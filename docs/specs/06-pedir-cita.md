# SPEC 06 — PEDIR CITA (`/pedir-cita`) Y BACKEND

> Fase 6.5 del plan v2. Es una **solicitud** de cita, no una reserva. En ningún texto, estado ni correo se dice "cita confirmada".
> No se desarrolla un sistema de reservas propio. Diseñado para conectar una agenda futura sin rehacer la página.

## 1. Página

- H1: "Pide tu cita" (o "Solicita tu cita"); subtítulo: "Rellena estos pasos y te contactaremos para confirmar día y hora." (`pending` de validación).
- Diseño limpio y centrado: contenedor ≤ 720 px, fondo surface con atmósfera muy suave, sin elementos flotantes que distraigan.
- Lateral (≥ 1024) o bloque inferior (móvil): datos de contacto alternativos (teléfono `tel:`, email) para quien prefiera llamar.
- `noindex`? **No**: la página se indexa (búsquedas "pedir cita podólogo {ciudad}").

## 2. Wizard (`BookingWizard`)

| Paso                   | Campo            | Tipo                                                                                                                                  | Validación                                                    |
| ---------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 01 Motivo              | `motivo`         | Option cards (radio): estudio-biomecanico · plantillas-personalizadas · podologia-general · podologia-infantil · pie-diabetico · otra | Requerido. Preseleccionable vía `?motivo=`.                   |
| 02 Primera visita      | `primeraVisita`  | Option cards: Sí / No                                                                                                                 | Requerido                                                     |
| 03 Preferencia horaria | `franja`         | Option cards: Mañana / Tarde / Indiferente                                                                                            | Requerido                                                     |
|                        | `fechaPreferida` | Fecha opcional (`<input type="date">` nativo, min = mañana, max = +90 días; días de cierre según horario si se conoce)                | Opcional; texto: "Preferencia orientativa, no reserva"        |
| 04 Datos               | `nombre`         | text, `autocomplete="name"`                                                                                                           | 2–80 caracteres                                               |
|                        | `telefono`       | tel, `autocomplete="tel"`, `inputmode="tel"`                                                                                          | Formato español/internacional (normalizado E.164 en servidor) |
|                        | `email`          | email, `autocomplete="email"`                                                                                                         | Email válido                                                  |
|                        | `privacidad`     | checkbox **obligatoria** + enlace a `/privacidad` (nueva pestaña con aviso)                                                           | Debe ser `true`                                               |
|                        | `comunicaciones` | checkbox **opcional**, desmarcada                                                                                                     | —                                                             |
| 05 Resumen             | —                | Resumen editable (enlace "Cambiar" por paso) + botón "Enviar solicitud" + Turnstile                                                   | —                                                             |

- **No hay campo de texto libre** sobre síntomas (minimización de datos de salud). Si la clínica lo quiere ("Otra consulta"), se valorará con asesoría; por defecto, no.
- Esquema Zod único en `shared/schemas/booking.ts`, usado por vee-validate (v5, Standard Schema) en cliente y por el endpoint en servidor. Validación por paso con sub-esquemas.

### Interacciones

- Indicador de progreso: "Paso 2 de 5" + barra/huellas (5 huellas que se rellenan). `aria-live="polite"` anuncia el cambio de paso.
- Transición entre pasos: desplazamiento horizontal 24 px + fundido (220 ms); reduced motion: solo fundido.
- En pasos de opción única, seleccionar **no avanza automáticamente** (evita errores y es más accesible); botón "Continuar".
- Botón "Volver" en pasos 2-5. El botón atrás del navegador retrocede de paso: cada paso se refleja en la query `?paso=n` con `router.push` (no `replace`). Entrar directamente en un paso posterior sin datos válidos redirige al primer paso incompleto.
- Al cambiar de paso, el foco va al encabezado del paso (`tabindex="-1"`).
- Errores: resumen arriba del paso con enlaces a los campos + mensaje junto a cada campo (`aria-invalid`, `aria-describedby`). Se valida al continuar y luego en `blur`.
- Conservación de datos: borrador en `sessionStorage` (`useBookingDraft`), **sin** los consentimientos; se borra tras el envío correcto. Nunca `localStorage` (dato potencialmente de salud).

### Estados de envío

| Estado                                     | UI                                                                                                                                                                                                                                                              |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enviando                                   | Botón en `loading`, campos bloqueados, `aria-busy`.                                                                                                                                                                                                             |
| Éxito (HTTP 200 con `{ ok: true, id }`)    | Pantalla de confirmación: "Hemos recibido tu solicitud" + "Te contactaremos en {plazo `pending`} para confirmar la cita" + resumen + nº de referencia + enlaces a Inicio/Servicios. Animación de huellas. **Solo se muestra tras respuesta real del servidor.** |
| Error de validación (422)                  | Vuelve al paso afectado con errores del servidor mapeados.                                                                                                                                                                                                      |
| Antispam fallido (403)                     | "No hemos podido verificar el envío. Inténtalo de nuevo o llámanos al {tel}." + reintento del Turnstile.                                                                                                                                                        |
| Límite (429)                               | Mensaje + teléfono.                                                                                                                                                                                                                                             |
| Error del proveedor/red (5xx/timeout 15 s) | "No se ha podido enviar. Tus datos siguen aquí" + reintentar + teléfono/email.                                                                                                                                                                                  |

## 3. Backend — `POST /api/cita`

Flujo en `server/api/cita.post.ts`:

1. Comprobar `Content-Type` JSON y tamaño (< 10 KB). Origen permitido (cabecera `Origin` = dominio propio).
2. **Antispam** (`server/utils/antispam.ts`):
   - Honeypot `website` vacío.
   - Tiempo desde el render del formulario ≥ 3 s (timestamp firmado con HMAC para que no se pueda falsificar).
   - Turnstile: `verifyTurnstileToken(token)` (o `fetch` a `challenges.cloudflare.com/turnstile/v0/siteverify`).
   - Rate limit: 5 solicitudes / 10 min / IP (en memoria por instancia; ver research §7.2).
3. Validación con el esquema Zod compartido (`readValidatedBody`). Normalización (trim, teléfono E.164, email minúsculas).
4. `bookingSink.submit(booking)` → implementación actual `EmailBookingSink`:
   - Correo a la clínica (`BOOKING_TO_EMAIL`): asunto "Nueva solicitud de cita · {motivo legible} · {nombre}", cuerpo HTML + texto con todos los campos, ID de referencia, fecha/hora, `reply-to` = email del paciente.
   - Acuse al paciente: "Hemos recibido tu solicitud" + resumen + aviso "no es una cita confirmada" + datos de contacto + enlace a privacidad. Sin datos de otros pacientes, sin tracking pixels.
5. Respuesta `{ ok: true, id }`. Si el correo a la clínica falla → 502 (la solicitud no se considera enviada). Si solo falla el acuse → 200 con `acknowledged: false` (la clínica sí la recibió).
6. Logs **sin datos personales** (solo ID, motivo, resultado).

### Interfaces

```ts
// shared/types/booking.ts
export type BookingReason =
  | 'estudio-biomecanico'
  | 'plantillas-personalizadas'
  | 'podologia-general'
  | 'podologia-infantil'
  | 'pie-diabetico'
  | 'otra'
export interface BookingRequest {
  motivo: BookingReason
  primeraVisita: boolean
  franja: 'manana' | 'tarde' | 'indiferente'
  fechaPreferida?: string
  nombre: string
  telefono: string
  email: string
  privacidad: true
  comunicaciones: boolean
  turnstileToken: string
  formTs: string
  website?: string
}
export interface BookingResponse {
  ok: true
  id: string
  acknowledged: boolean
}

// server/utils/booking-sink.ts
export interface BookingSink {
  submit(b: NormalizedBooking): Promise<{ id: string; acknowledged: boolean }>
}
// server/utils/mailer/index.ts
export interface Mailer {
  send(msg: { to: string; replyTo?: string; subject: string; html: string; text: string }): Promise<void>
}
```

Una agenda futura = nueva implementación de `BookingSink` (p. ej. `AgendaApiBookingSink`), sin tocar la página.

### Variables de entorno (`runtimeConfig`, nunca expuestas al cliente salvo las `public`)

`MAIL_PROVIDER`, `RESEND_API_KEY` | `BREVO_API_KEY`, `MAIL_FROM`, `BOOKING_TO_EMAIL`, `TURNSTILE_SECRET_KEY`, `FORM_HMAC_SECRET`, público: `NUXT_PUBLIC_TURNSTILE_SITE_KEY`.

## 4. Legal y privacidad

- Capa informativa breve bajo el botón de envío (responsable, finalidad, base jurídica, destinatarios —proveedor de correo como encargado—, derechos, enlace a política). **Redacción final por asesoría** (`pending`).
- Consentimiento de comunicaciones comerciales separado y **opcional**.
- Sin almacenamiento en BD. Retención en el buzón definida por la clínica.

## 5. Pruebas

- Unit: esquema Zod (válidos/ inválidos por campo), normalización de teléfono, antispam (honeypot, tiempo, firma HMAC), mapeo de errores.
- Endpoint: con `Mailer` y Turnstile simulados (inyectados): 200, 422, 403, 429, 502.
- Componentes: navegación entre pasos, conservación del borrador, preselección por `?motivo=`, foco y anuncios, no avance automático, estado de éxito solo tras respuesta.
- E2E (si se aprueba Playwright): flujo completo en 390 y 1440 px contra un mailer de pruebas.
