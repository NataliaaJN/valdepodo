/**
 * Pie diabético (spec 04 §5). Textos propios, sobrios y sin lenguaje alarmista ni promesas (spec 09 §4).
 * Referencias de enfoque: páginas de pie diabético de otras clínicas, reescritas con voz propia.
 */

export interface DiabeticItem {
  title: string
  text: string
}

export interface DiabeticSign extends DiabeticItem {
  icon: 'wound' | 'temperature' | 'tingle' | 'swelling'
}

export const diabetic = {
  description:
    'Revisiones periódicas y cuidados podológicos para prevenir complicaciones en el pie de las personas con diabetes.',
  intro:
    'La diabetes puede reducir la sensibilidad y la circulación del pie, así que una herida pequeña puede pasar desapercibida y complicarse. Revisar los pies con regularidad es la mejor forma de adelantarse.',
  /** Qué incluye cada revisión. */
  reviewTitle: 'Qué incluye la revisión',
  review: [
    {
      title: 'Historia y hábitos',
      text: 'Empezamos hablando contigo: cómo llevas la diabetes, qué medicación tomas y si notas dolor, hormigueo o calambres.',
    },
    {
      title: 'Sensibilidad',
      text: 'Comprobamos con pruebas sencillas e indoloras si el pie siente bien el tacto, la presión y la vibración.',
    },
    {
      title: 'Circulación',
      text: 'Valoramos los pulsos y el aspecto de la piel para ver cómo llega la sangre al pie.',
    },
    {
      title: 'Uñas y durezas',
      text: 'Cortamos las uñas y retiramos las durezas con cuidado, porque son el origen más habitual de heridas.',
    },
    {
      title: 'Calzado y apoyo',
      text: 'Revisamos tu calzado y cómo pisas, y valoramos si necesitas plantillas para repartir mejor la presión.',
    },
    {
      title: 'Seguimiento',
      text: 'Según tu nivel de riesgo, te proponemos cada cuánto volver. Cuanto mayor el riesgo, más cercanas las revisiones.',
    },
  ] as readonly DiabeticItem[],
  /** Señales que piden consultar cuanto antes. */
  signsTitle: 'Señales que requieren valoración',
  signs: [
    {
      title: 'Heridas que no mejoran',
      icon: 'wound',
      text: 'Una herida, ampolla o grieta que no cicatriza en unos días.',
    },
    {
      title: 'Cambios de color o temperatura',
      icon: 'temperature',
      text: 'Una zona del pie más roja, más pálida, más oscura o más fría o caliente que el resto.',
    },
    {
      title: 'Hormigueo o pérdida de sensibilidad',
      icon: 'tingle',
      text: 'Adormecimiento, pinchazos o la sensación de llevar un calcetín puesto sin llevarlo.',
    },
    {
      title: 'Hinchazón o dolor sin causa',
      icon: 'swelling',
      text: 'Un pie hinchado o dolorido sin golpe ni esfuerzo que lo explique.',
    },
  ] as readonly DiabeticSign[],
  urgentNotice:
    'Ante una herida que no cicatriza, enrojecimiento que se extiende, supuración o fiebre, acude a tu médico o a urgencias sin esperar a la cita.',
  /** Cuidados diarios en casa. */
  careTitle: 'Cuidados de cada día',
  care: [
    {
      title: 'Míralos a diario',
      text: 'Revisa la planta, los talones y entre los dedos. Si no llegas, ayúdate de un espejo o pide ayuda.',
    },
    {
      title: 'Lávalos y sécalos',
      text: 'Agua templada, jabón suave y secado cuidadoso, sobre todo entre los dedos.',
    },
    {
      title: 'Hidrata la piel',
      text: 'Una crema hidratante en planta y talones, sin aplicarla entre los dedos.',
    },
    { title: 'Nunca descalzo', text: 'Tampoco en casa ni en la playa: un pequeño corte puede no notarse.' },
    {
      title: 'Calzado y calcetines',
      text: 'Calzado cómodo y que no apriete, y calcetines sin costuras gruesas. Mira dentro del zapato antes de ponértelo.',
    },
    {
      title: 'Uñas con cuidado',
      text: 'Córtalas rectas y sin rematar las esquinas. Si ves poco o sientes poco, déjalo en manos del podólogo.',
    },
  ] as readonly DiabeticItem[],
  disclaimer: 'Estas recomendaciones son generales y no sustituyen una valoración profesional individual.',
}
