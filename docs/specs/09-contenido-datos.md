# SPEC 09 — MODELO DE CONTENIDO Y MARCADORES DE CONTENIDO PROVISIONAL

> Objetivo: que ningún dato inventado llegue a producción y que todo dato pendiente sea fácil de localizar y sustituir.

## 1. Ubicación

| Fichero                                     | Contenido                                                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `app/data/site.ts`                          | Nombre, ciudad, dirección, coordenadas, teléfono, email, Instagram, LinkedIn, horario, `foundedYear`, frases de marca          |
| `app/data/services.ts`                      | 5 servicios: slug, nombre, resumen, descripción, necesidades, SEO, CTA, recurso gráfico                                        |
| `app/data/biomech.ts`                       | Fases del estudio + estados del mapa de presión                                                                                |
| `app/data/insole.ts`                        | Etiquetas genéricas de las capas conceptuales (ids de `tools/blender/config/insole.json`), pasos del proceso, textos de fibras |
| `app/data/treatments.ts`                    | Tratamientos de podología general                                                                                              |
| `app/data/kids.ts`, `app/data/diabetic.ts`  | Contenido de infantil y pie diabético                                                                                          |
| `app/data/anatomy.ts`                       | Etiquetas del pie 3D                                                                                                           |
| `app/data/team.ts`, `app/data/clinic.ts`    | Profesionales, fotos, hitos                                                                                                    |
| `app/data/values.ts`, `app/data/reviews.ts` | Valores, reseñas reales                                                                                                        |
| `app/data/legal.ts`                         | Responsable del tratamiento, textos legales                                                                                    |

Tipos en `shared/types/content.ts`. Sin Nuxt Content (no hace falta CMS en v1).

## 2. Marcador `pending()`

```ts
// shared/utils/pending.ts
export interface Pending<T> {
  readonly __pending: true
  value: T
  note: string
}
export const pending = <T>(value: T, note: string): Pending<T> => ({ __pending: true, value, note })
export type Maybe<T> = T | Pending<T>
```

- Uso: `phone: pending('+34 000 000 000', 'Teléfono real de la clínica')`.
- Componente `<ContentValue :value>` / helper `resolve()` devuelve el valor; en **dev y preview** envuelve el contenido pendiente con `PendingBadge` (subrayado discontinuo cian + tooltip con la nota).
- Valores provisionales visualmente inequívocos (`+34 000 000 000`, "Nombre Apellido", "[Texto pendiente de validar]") — nunca datos verosímiles que puedan pasar por reales.
- Imágenes pendientes: ilustración neutra de marca con texto "Fotografía pendiente", **nunca stock**.

## 3. Comprobación automática

- `tools/check-pending.ts`: importa los ficheros de `app/data/`, recorre los objetos y lista todos los `Pending` con su ruta y nota. Además busca en `app/**/*.vue` el literal `pending(`.
- `npm run check:pending` → informe (tabla) para enviar a la clínica.
- En el build de **producción** (`NUXT_PUBLIC_SITE_ENV=production`), un hook `build:before` ejecuta la comprobación y **falla** si queda algún `Pending` (criterio de aceptación: "no queden textos ni recursos de demostración sin identificar").
- Los previews (Vercel/Netlify preview) sí se construyen con marcadores visibles.

## 4. Contenido clínico

- Todo texto clínico se crea como `pending(texto, 'Validar con la clínica')`, aunque el borrador sea razonable.
- La clínica valida por página; al validar se elimina el envoltorio `pending`.
- Prohibido: diagnósticos, promesas de resultados, cifras clínicas no aportadas por la clínica, materiales de plantillas no confirmados.

## 5. Textos ya definidos en la especificación (no son `pending`)

Titulares y CTA literales de la especificación maestra ("Todo empieza por tus pies.", "Cuidamos de tus pies en cada paso.", "La confianza se construye paso a paso.", "Da el próximo paso.", "Soluciones para cuidar de tus pies.", etc.) y los nombres de servicios, fases y valores, salvo la cifra "9 años" (depende de `foundedYear`).
