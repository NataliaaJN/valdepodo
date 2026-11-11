# SPEC 02 — LAYOUT GLOBAL: LOADING, NAVBAR, FOOTER, TRANSICIONES

> Fase 6.1 del plan v2. Componentes en `app/components/layout/`.

## 1. Loading de marca (`BrandIntro`)

**Precondición:** logo vectorial real. Sin él, **no se implementa la transformación** (sería inventar marca); como mucho, un fundido simple del wordmark provisional, o nada.

**Nota v2:** el símbolo del logo ya es una huella: cinco dedos ovalados y un trazo continuo azul/cian que dibuja el contorno de la planta. La secuencia natural es: los dedos aparecen uno a uno → el trazo se dibuja (`stroke-dashoffset` sobre los paths originales) → aparece el wordmark → el logo vuela a la navbar. Requiere el SVG con trazos separables; se descarta vectorizar el raster sin aprobación de la clínica.

### Secuencia (total ≤ 1,8 s)

| t (ms)    | Acción                                                                                                                                                                             |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–350     | Aparece la huella/pie minimalista (trazo SVG dibujándose, `stroke-dashoffset`).                                                                                                    |
| 350–700   | Pequeño movimiento (rotación −6° → 0°, traslación 8 px, como un paso).                                                                                                             |
| 700–1200  | Los trazos se transforman en el símbolo del logo (interpolación de paths con GSAP; requiere preparar ambos SVG con nº de puntos compatible, o técnica de "trazo que se redibuja"). |
| 1200–1500 | Se completa el logotipo (wordmark aparece).                                                                                                                                        |
| 1500–1800 | El logo vuela a su posición en la navbar (técnica FLIP: medir la posición final del logo de la navbar) y el overlay se desvanece revelando la página.                              |

### Reglas

- Se muestra **solo en la primera visita de la sesión** (`sessionStorage['vp-intro'] = '1'`).
- Decisión **antes del primer pintado**: script inline en `<head>` que añade `data-intro="play|skip"` a `<html>`; el CSS oculta el overlay con `skip`. Evita parpadeos.
- `prefers-reduced-motion` → `skip`. Sin JS → el overlay no existe (se renderiza solo con `data-intro="play"`).
- **No espera a ningún recurso** (ni fuentes ni 3D). Si el usuario hace scroll, pulsa una tecla o toca → se acelera a la salida.
- El contenido de la página está renderizado debajo (SSR) y es accesible: el overlay lleva `aria-hidden="true"`.
- Fallback de seguridad: si algo falla, el overlay se elimina a los 2,5 s.

## 2. Navbar (`SiteNavbar`)

### Elementos

Logo (enlace a `/`, `aria-label="Valdepodo, inicio"`) · Servicios · La clínica · Contacto · **Pedir cita** (BaseButton primary, tamaño compacto).

| Ítem       | Destino                                                           |
| ---------- | ----------------------------------------------------------------- |
| Servicios  | `/servicios` (escritorio: submenú con los 5 servicios, ver abajo) |
| La clínica | `/conocenos`                                                      |
| Contacto   | `/contacto`                                                       |
| Pedir cita | `/pedir-cita`                                                     |

Submenú de Servicios (escritorio): panel desplegable glass con los 5 servicios + enlace "Ver todos". Abre con clic o teclado (`Enter`/`Space`/`ArrowDown`), también en hover con retardo de 120 ms solo con puntero fino. `aria-expanded`, `Esc` cierra y devuelve el foco. _Si se prefiere simplicidad, Servicios es un enlace directo: decidir en la propuesta visual._

### Comportamiento

- `position: sticky; top: 0`. Altura 88 px → 68 px tras 24 px de scroll (transición `dur-base`).
- Al inicio: fondo transparente integrado con el hero. Tras el umbral: fondo `surface` 85 % + blur + borde inferior `border`.
- Opcional: se oculta al hacer scroll hacia abajo y reaparece hacia arriba (**desactivado durante secuencias pineadas** para no tapar contenido; decidir en propuesta).
- Estado activo: `aria-current="page"` + subrayado/indicador (punto cian). (La clínica y el equipo son una sola página: `/conocenos`, con `#equipo` como ancla.)
- `scroll-margin-top` global = altura compacta + 16 px.

### Móvil (< 1024 px)

- Visibles: logo, botón "Pedir cita" (compacto) y botón menú (`aria-controls`, `aria-expanded`, etiqueta "Abrir menú"/"Cerrar menú").
- Menú: panel a pantalla completa (fondo surface + atmósfera de degradado + líneas orgánicas), enlaces grandes (display-m), datos de contacto rápidos (tel., Instagram) al pie.
- Animación discreta: fundido + desplazamiento 12 px, stagger de enlaces 40 ms.
- Accesibilidad: foco atrapado dentro del panel, `Esc` cierra, foco devuelto al botón, `inert` en el resto de la página, bloqueo de scroll del body.
- Se cierra al navegar (watch de la ruta).

## 3. Footer (`SiteFooter`)

Fondo **deep-blue** (única gran superficie oscura, cierra la página) con huellas/líneas cian a baja opacidad; alternativa surface si la propuesta visual lo pide.

Columnas (escritorio 4 · tablet 2 · móvil 1, con acordeón **no**: todo visible):

1. Logo + frase de marca ("Salud desde la base." u otra validada) + "9 años cuidando de la salud de tus pies" (calculado desde año de apertura).
2. Navegación: Inicio, Servicios, La clínica, Pedir cita, Contacto.
3. Servicios: los 5.
4. Contacto: dirección, teléfono (`tel:`), email (`mailto:`), Instagram.

Barra inferior: © año · Aviso legal · Política de privacidad · Política de cookies · Créditos.

Todos los datos vienen de `app/data/site.ts` (con `pending()` hasta confirmarlos).

## 4. Transiciones entre páginas

- Nuxt `app.pageTransition = { name: 'page', mode: 'out-in' }` con CSS: salida opacidad 1→0 + `y 0→-8px` (200 ms), entrada 0→1 + `8px→0` (280 ms).
- La navbar y el logo **no** participan (están fuera de `<NuxtPage>`): continuidad del logo.
- Hook `page:finish` → `ScrollTrigger.refresh()` y scroll al inicio / al ancla.
- Reduced motion: solo fundido de 120 ms.
- Nunca interceptan el botón atrás; sin pantallas de carga.

## 5. Cursor personalizado (opcional, decidir en propuesta visual)

- Solo `(hover: hover) and (pointer: fine)` y sin reduced motion.
- No sustituye el cursor del sistema: es una **etiqueta flotante** que acompaña al cursor nativo en zonas concretas: "Explorar" (modelo 3D), "Ver" (fotos ampliables), "Arrastrar" (carruseles).
- `pointer-events: none`, `aria-hidden`. La acción real siempre tiene su control accesible equivalente.

## 6. Otros elementos globales

- `SkipLink` "Saltar al contenido" como primer elemento enfocable.
- `error.vue`: 404 con huella "perdida" ("Este camino no lleva a ninguna parte") + enlaces a Inicio y Pedir cita.
- Banner de cookies: **solo** si hay cookies no esenciales. Con la arquitectura propuesta (fuentes autoalojadas, mapa con fachada, sin analítica) no hace falta banner global; el mapa pide consentimiento en su propia fachada.

## CTA global (pre-footer)

`CtaBlock` cierra todas las páginas desde el layout `default` (excepto las que declaran `definePageMeta({ hideCta: true })`, hoy `/pedir-cita`). Banda azul Valdepodo de altura contenida: titular «Da el próximo paso.», una frase de apoyo y el botón «Pedir cita» → `/contacto#cita` (formulario de solicitud embebido en Contacto). Sin 3D ni GSAP; trazo orgánico discreto de fondo.
