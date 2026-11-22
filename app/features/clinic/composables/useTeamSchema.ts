/**
 * `Person` del equipo (solo personas con nombre y cargo confirmados), enlazadas a la clínica del grafo
 * schema.org. Solo datos visibles en la página «Equipo»; sin colegiado ni titulaciones que no se muestren.
 */
import { isPending } from '#shared/utils/pending'
import type { TeamMember } from '~/features/clinic/data/team'

export function useTeamSchema(team: readonly TeamMember[]) {
  const people = team.filter((m) => !isPending(m.name) && !isPending(m.role))
  if (!people.length) return

  useHead({
    script: [
      {
        key: 'schema-team',
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': people.map((m) => ({
            '@type': 'Person',
            name: m.name,
            // «Copropietaria | Podóloga» → el último tramo es el oficio
            jobTitle: String(m.role).split('|').pop()?.trim(),
            image: m.photo ? absoluteUrl(m.photo.src) : undefined,
            sameAs: m.linkedin && !isPending(m.linkedin) ? [m.linkedin] : undefined,
            worksFor: { '@id': clinicSchemaId() },
          })),
        }),
      },
    ],
  })
}
