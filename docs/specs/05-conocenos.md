# SPEC 05 — LA CLÍNICA (`/conocenos`)

> Fase 6.4 del plan v2, unificada tras el rediseño: «La clínica» y «Equipo» son una sola página que cuenta Personas → Forma de trabajar → Experiencia → Espacio (`#equipo` sigue funcionando como ancla). Datos en `app/data/team.ts`, `app/data/clinic.ts`.
> **Nunca** fotos de stock para el equipo o las instalaciones. Sin datos reales → placeholder ilustrado marcado.

## SEO

Title "Conócenos · Equipo y clínica · Valdepodo"; H1 del hero; schema `Person` (por profesional, solo con datos confirmados) vinculado a la organización.

## 1. Hero (`ClinicHero`)

- Fotografía real del equipo a sangre bajo la navbar (`clinic.teamPhoto`; sin foto, marcador «Fotografía del equipo pendiente»), velo de tinta para el contraste y composición mínima: etiqueta, H1 "Detrás de cada paso, hay personas." y una entradilla.

## 2. Equipo (`#equipo`, `TeamCard`)

Tarjetas compactas (4:5, `radius-l` = 8 px) junto a un titular sticky. Reposo: foto + nombre y cargo abajo a la izquierda sobre un velo; redes (solo si la persona las autoriza) arriba a la derecha. Hover/foco (puntero fino): el degradado crece y sobre la parte inferior se despliega descripción, especialidades y colegiación (grid 0fr → 1fr + fundido). Táctil: la información ampliada se ve siempre. Contenido siempre en el DOM; la tarjeta es enfocable.

## 3. Cómo trabajamos (`MethodTimeline`)

Escuchar · Analizar · Valorar · Tratar · Acompañar (`clinic.method`) como línea de pasos conectados sobre tinta. ≥ 1024 px horizontal, < 1024 px vertical. ScrollTrigger sin fijar: la línea se rellena con el scroll y enciende cada paso. Sin JS o con reduced motion: todo visible. (La Home mantiene sus cuatro verbos en `clinic.philosophy`.)

## 4. Experiencia (`ExperienceSection`)

Minisección de confianza entre filetes: cifra «9 años» (desde `site.foundedYear`), frase y texto de trayectoria. Hitos solo si son reales.

## 5. Espacio (`MediaMosaic`)

H2 "Un espacio pensado para cuidar de ti" + texto de apoyo. Composición editorial de cuatro imágenes de tamaño distinto (no una galería) con lightbox accesible (`<dialog>`).

## 6. CTA

El CTA global «Da el próximo paso.» lo pinta el layout (ver spec 02): botón «Pedir cita» → `/contacto#cita`.
