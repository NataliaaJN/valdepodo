# Rediseño global — Revisión final

Rama `feature/rediseno-global`. Revisión de la lista de comprobación de `01-direccion-de-arte.md` §11.

| Pregunta                           | Respuesta | Qué se hizo / qué queda                                                                                                                                                                   |
| ---------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ¿Parece una plantilla?             | No        | Hero a sangre con claim monumental, capítulos de color (azul · hueso · tinta), sin blobs/órbitas/chips, sin cajas redondeadas, cabecera común (`PageHeader`) y footer con rótulo gigante. |
| ¿La tipografía tiene personalidad? | Sí        | Bricolage Grotesque (peso + ancho, condensada en monumentales) + Instrument Sans. Se eliminó la cursiva de color de los titulares.                                                        |
| ¿Primera impresión memorable?      | Sí        | Pie 3D blanco sobre azul, entre dos capas del claim («próximo» detrás, «paso.» delante), que «da el paso» con el scroll.                                                                  |
| ¿El 3D está integrado?             | Sí        | Es parte de la composición (solapa el texto, avanza con el scroll, se acerca y se funde). El cierre reutiliza el póster del pie (un solo WebGL por página).                               |
| ¿Fotografía coherente?             | Sí        | Tratamiento común monocromo azul → color en hover/activo (`ServiceTile`, `.photo-duo`). Sustituir placeholders = editar `app/data/service-media.ts`.                                      |
| ¿Demasiado glassmorphism?          | No        | Solo en las 4 micro-tarjetas de datos, la navbar con scroll, el aviso del mapa y el panel del equipo (escritorio).                                                                        |
| ¿Demasiadas tarjetas?              | No        | Las tarjetas bordeadas se sustituyen por filetes y tipografía. Quedan las 5 piezas fotográficas de servicios y las del formulario de cita.                                                |
| ¿Hay espacio negativo?             | Sí        | `--space-section` hasta 200 px; pausa de datos; manifiesto casi solo tipográfico.                                                                                                         |
| ¿Las animaciones aportan algo?     | Sí        | Entrada por líneas, zoom lento de foto, botón que «rueda», cierre con escala creciente y botón magnético, navbar que cambia de tema. Todo desactivado con `prefers-reduced-motion`.       |
| ¿Las páginas son la misma marca?   | Sí        | `PageHeader`, `ServiceTile`, `CtaBlock` (cierre «Da el próximo paso.»), `SiteFooter` y tokens compartidos en todas.                                                                       |

## Decisiones técnicas relevantes

- **Fuentes autoalojadas** con `@fontsource-variable` (se retira `@nuxt/fonts`): sin peticiones a Google (RGPD) y sin el fallo de certificado de Node al resolverlas. Se precargan los subconjuntos latinos.
- **Tokens**: se conservan los nombres (`primary`, `deep-blue`, `surface`…) con valores nuevos; radio único de 8 px; sombras sustituidas por filetes.
- **Hero fijado**: el margen negativo bajo la navbar vive en el contenedor de la página, no en el elemento que GSAP fija (el `pin-spacer` lo anulaba).
- Se eliminan `ProposalToolbar` (selector A/B de la propuesta) y `ValuesStrip` (sus datos pasan a `HomeFacts`).

## Pendiente / no verificado

- Sin revisión visual en tablet (768–1023) ni del hover de los tiles con puntero real; el navegador integrado dejó de renderizar al final. Comprobado por código: lint, `nuxt typecheck`, 130 tests y `npm run build`.
- Medir Lighthouse móvil de la Home (antes 94): el hero ahora lleva texto grande + póster; las fotos de servicio son externas (Unsplash) hasta que lleguen las definitivas.
- Textos nuevos (etiquetas «Método», «Cuatro verbos, un solo paso.», «Sigue el camino.») no están validados por la clínica.
- Las URL de Unsplash son placeholders: no deben llegar a producción.
