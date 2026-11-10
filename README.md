# Valdepodo — web

Nueva web de **Valdepodo, clínica de podología** (Valdemoro, Madrid).

Stack: Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Three.js + TresJS · VeeValidate + Zod · Vitest.
La documentación completa (research, plan, specs y pipeline 3D) está en [`docs/`](docs/README.md).

## Requisitos

- Node.js ≥ 22 y npm
- (Pipeline 3D) Blender **5.2 LTS** — ver [`docs/3d-pipeline.md`](docs/3d-pipeline.md) §4

## Puesta en marcha

```bash
npm install
cp .env.example .env   # completar cuando haga falta
npm run dev            # http://localhost:3000
```

| Script                              | Qué hace                                                               |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `npm run dev`                       | Servidor de desarrollo                                                 |
| `npm run build` / `npm run preview` | Build de producción (prerender) y previsualización                     |
| `npm run lint` / `npm run format`   | ESLint / Prettier                                                      |
| `npm run typecheck`                 | Comprobación de tipos (vue-tsc)                                        |
| `npm test`                          | Vitest (proyectos `unit` y `nuxt`)                                     |
| `npm run check:pending`             | Informe del contenido provisional (`pending()`) para la clínica        |
| `npm run 3d:check-env`              | Comprueba Blender 5.2 y el exportador glTF                             |
| `npm run 3d:smoke`                  | Prueba del pipeline 3D: Blender → GLB → meshopt → comprobación         |
| `npm run 3d:check`                  | Manifiesto, créditos y presupuestos de los modelos en `public/models/` |

## Laboratorio

`/_lab` reúne las experiencias 3D y gráficas en desarrollo y el sistema de diseño (`/_lab/sistema`). Está disponible en `npm run dev` y se excluye del build de producción (salvo con `NUXT_PUBLIC_ENABLE_LAB=true`).

## Estructura

```
app/        Aplicación Nuxt (páginas, componentes, composables, estilos)
shared/     Código compartido cliente/servidor (esquemas, tipos, utilidades)
server/     API de Nitro: POST /api/cita (solicitud de cita) y GET /api/cita/token
public/     Estáticos: modelos GLB (+ CREDITS.md), imágenes, favicon
tools/      Pipeline 3D (Blender + gltf-transform), independiente de la app
tests/      Vitest
docs/       Research, plan, specs y pipeline 3D
```

## Contenido provisional

Todo dato que la clínica no ha confirmado va envuelto en `pending()` (spec 09) y se marca en pantalla con un
subrayado discontinuo fuera de producción. `npm run check:pending` genera el informe para enviar a la clínica
(`-- --md` en Markdown). El build con `NUXT_PUBLIC_SITE_ENV=production` falla mientras quede alguno.
