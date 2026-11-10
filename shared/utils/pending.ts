/**
 * Marcador de contenido provisional (spec 09).
 * Todo dato no confirmado por la clínica se envuelve con `pending(valor, nota)`.
 * El build de producción falla si queda alguno (tools/check-pending, Fase 6+).
 */
export interface Pending<T> {
  readonly __pending: true
  readonly value: T
  readonly note: string
}

export type Maybe<T> = T | Pending<T>

export function pending<T>(value: T, note: string): Pending<T> {
  return { __pending: true, value, note }
}

export function isPending<T>(input: Maybe<T>): input is Pending<T> {
  return typeof input === 'object' && input !== null && (input as { __pending?: unknown }).__pending === true
}

export function resolveValue<T>(input: Maybe<T>): T {
  return isPending(input) ? input.value : input
}

export interface PendingEntry {
  path: string
  note: string
}

/** Recorre un objeto de contenido y devuelve la ruta y la nota de cada marcador pendiente. */
export function collectPending(input: unknown, path = ''): PendingEntry[] {
  if (isPending(input)) return [{ path: path || '(raíz)', note: input.note }]
  if (Array.isArray(input)) return input.flatMap((item, i) => collectPending(item, `${path}[${i}]`))
  if (typeof input === 'object' && input !== null) {
    return Object.entries(input).flatMap(([key, value]) =>
      collectPending(value, path ? `${path}.${key}` : key),
    )
  }
  return []
}
