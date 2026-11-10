/** Tipos de contenido compartidos (spec 09 §1). */

/** Titular con palabra destacada en itálica display (spec 01 §2). */
export interface Headline {
  before: string
  accent?: string
  after?: string
}
