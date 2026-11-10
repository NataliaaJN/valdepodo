# SPEC 07 — CONTACTO (`/contacto`)

> Fase 6.6 del plan v2. Datos públicos localizados en la ficha de Google (research §3.1), pendientes de confirmar por la clínica. Todos los datos desde `app/data/site.ts` (mismos que footer y schema.org). Sin datos inventados: `pending()` hasta confirmar.

## 1. Estructura

- H1: "Estamos aquí para _ayudarte_."
- Layout escritorio: 2 columnas — izquierda bloques de información (5 col), derecha mapa (7 col, alto ~520 px, **no a pantalla completa**). Tablet: información en 2×2 + mapa debajo. Móvil: bloques apilados + mapa 4:3.

## 2. Bloques de información

| Bloque    | Contenido                                                                                                                                                                             | Acción                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Dirección | Dirección completa en `<address>`                                                                                                                                                     | "Cómo llegar" → `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}` (abre app en móvil) |
| Teléfono  | Número formateado                                                                                                                                                                     | `tel:+34…` (botón grande en móvil)                                                                   |
| Email     | Correo                                                                                                                                                                                | `mailto:`                                                                                            |
| Instagram | @usuario                                                                                                                                                                              | Enlace al perfil oficial (`rel="noopener"`, nueva pestaña)                                           |
| Horario   | Tabla por días (`<table>` o `<dl>`), indicando cerrado. Opcional: estado "Abierto ahora / Cerrado" calculado en cliente con zona `Europe/Madrid` (solo si el horario está confirmado) | —                                                                                                    |

Cada bloque: icono lineal propio, eyebrow, dato en heading-s, acción como BaseLink. Copiar al portapapeles opcional para dirección/teléfono (con feedback `aria-live`).

## 3. Mapa (`MapFacade`)

- Estado inicial (SSR): ilustración propia del entorno (o imagen estática de mapa generada/licenciada) con marcador de marca + texto "Al cargar el mapa, Google puede instalar cookies" + botón "Ver mapa interactivo" + botón "Cómo llegar".
- Al pulsar: se inserta el `<iframe>` de Google Maps (embed con la ubicación exacta y marcador), `loading="lazy"`, `title="Mapa de ubicación de Valdepodo"`, `referrerpolicy="no-referrer-when-downgrade"`. Preferencia recordada en `localStorage` (solo la preferencia, no datos personales).
- Si se usa Maps Embed API con clave: restringida por dominio, en `runtimeConfig.public`.
- Coordenadas exactas en `site.ts` (`pending`).

## 4. CTA

Bloque final "¿Prefieres que te llamemos?" / "Pide tu cita online" + botón "Pedir cita".

## 5. SEO local

- Title "Contacto · Valdepodo · Podología en {ciudad}".
- Schema `MedicalClinic` con `address`, `geo`, `telephone`, `openingHoursSpecification`, `hasMap`, `sameAs`. Mismo NAP (nombre, dirección, teléfono) exacto que Google Business Profile.
