/**
 * Pie diabético (spec 04 §5). Estética sobria. Todo en `pending()`, incluido el aviso de urgencias y el
 * descargo de las recomendaciones (los valida la clínica).
 */
import { pending, type Maybe } from '#shared/utils/pending'

const NOTE = 'Contenido de pie diabético (spec 04 §5): validar con la clínica'

export const diabetic = {
  description: pending(
    'Revisiones y cuidados podológicos para prevenir complicaciones en el pie de las personas con diabetes.',
    NOTE,
  ) as Maybe<string>,
  prevention: pending(
    'La diabetes puede reducir la sensibilidad y la circulación del pie. Una pequeña lesión que pasa desapercibida puede complicarse, por eso la prevención y las revisiones periódicas son tan importantes.',
    NOTE,
  ) as Maybe<string>,
  care: [
    {
      title: 'Revisión del pie',
      text: pending('Exploramos la piel, las uñas, la sensibilidad y la circulación.', NOTE),
    },
    { title: 'Cuidado de uñas y piel', text: pending('Tratamos uñas y durezas con especial cuidado.', NOTE) },
    {
      title: 'Consejo de calzado',
      text: pending('Te orientamos sobre el calzado y los cuidados en casa.', NOTE),
    },
  ] as readonly { title: string; text: Maybe<string> }[],
  signs: [
    pending('Una herida, ampolla o grieta que no mejora.', NOTE),
    pending('Cambios de color o de temperatura en el pie.', NOTE),
    pending('Hormigueo, adormecimiento o pérdida de sensibilidad.', NOTE),
    pending('Hinchazón o dolor sin causa aparente.', NOTE),
  ] as readonly Maybe<string>[],
  urgentNotice: pending(
    'Ante una herida que no cicatriza o signos de infección, acude a tu médico o servicio de urgencias.',
    'Aviso destacado de la spec 04 §5: texto a validar por la clínica',
  ) as Maybe<string>,
  recommendations: [
    pending('Revisa tus pies a diario, también entre los dedos.', NOTE),
    pending('Lávalos con agua templada y sécalos bien.', NOTE),
    pending('Hidrata la piel, pero no entre los dedos.', NOTE),
    pending('No camines descalzo y revisa el interior del calzado.', NOTE),
  ] as readonly Maybe<string>[],
  disclaimer: pending(
    'Estas recomendaciones son generales y no sustituyen una valoración profesional individual.',
    'Descargo de la spec 04 §5: validar con la clínica',
  ) as Maybe<string>,
}
