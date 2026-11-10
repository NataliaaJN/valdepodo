/**
 * Textos legales (spec 09 §1, spec 06 §4). **Borradores estructurales**: la redacción final la hace la
 * asesoría de la clínica. Todo va en `pending()`, así que el build de producción falla hasta que se validen.
 *
 * Reflejan la arquitectura real de la web: sin analítica, fuentes autoalojadas, sin cookies propias; el
 * mapa de Google solo se carga con consentimiento (fachada) y Turnstile solo en el formulario de cita.
 */
import { pending, type Maybe } from '#shared/utils/pending'

export interface LegalSection {
  title: string
  paragraphs: readonly Maybe<string>[]
}

export interface LegalPage {
  title: string
  description: string
  updated: Maybe<string>
  sections: readonly LegalSection[]
}

const ADVISORY = 'Redacción provisional: la revisa y completa la asesoría de la clínica'
const p = (text: string) => pending(text, ADVISORY)

export const controller = {
  name: pending('[Razón social pendiente]', 'Titular de la web'),
  taxId: pending('[NIF/CIF pendiente]', 'NIF o CIF del titular'),
  registry: pending(
    '[Datos registrales o de colegiación pendientes]',
    'Registro mercantil o colegio profesional',
  ),
}

const UPDATED = pending('[Fecha de la última revisión]', 'Fecha de la versión revisada por la asesoría')

export const legalNotice: LegalPage = {
  title: 'Aviso legal',
  description: 'Información sobre el titular de la web de Valdepodo y las condiciones de uso.',
  updated: UPDATED,
  sections: [
    {
      title: 'Titular de la web',
      paragraphs: [
        p(
          'En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se informa de los datos del titular de esta web: denominación, NIF, domicilio, datos de contacto y datos registrales o de colegiación profesional.',
        ),
      ],
    },
    {
      title: 'Objeto y condiciones de uso',
      paragraphs: [
        p(
          'Esta web informa sobre los servicios de la clínica y permite enviar solicitudes de cita. El uso de la web implica la aceptación de estas condiciones.',
        ),
        p(
          'La información de la web es general y no sustituye una valoración profesional individual. Ninguna solicitud enviada a través del formulario constituye una cita confirmada hasta que la clínica la confirme.',
        ),
      ],
    },
    {
      title: 'Propiedad intelectual',
      paragraphs: [
        p(
          'Los textos, diseños, ilustraciones y elementos gráficos de esta web pertenecen a su titular o se usan con licencia. Los recursos de terceros y sus licencias se detallan en la página de créditos.',
        ),
      ],
    },
    {
      title: 'Responsabilidad y enlaces',
      paragraphs: [
        p(
          'El titular no se hace responsable del contenido de las webs de terceros a las que se enlace (por ejemplo, Google Maps o Instagram).',
        ),
      ],
    },
  ],
}

export const privacyPolicy: LegalPage = {
  title: 'Política de privacidad',
  description: 'Cómo trata Valdepodo tus datos personales y cómo puedes ejercer tus derechos.',
  updated: UPDATED,
  sections: [
    {
      title: 'Responsable del tratamiento',
      paragraphs: [
        p(
          'Identidad y datos de contacto del responsable y, en su caso, del delegado de protección de datos.',
        ),
      ],
    },
    {
      title: 'Qué datos tratamos y para qué',
      paragraphs: [
        p(
          'Solicitudes de cita: motivo de la consulta, si es tu primera visita, tu preferencia horaria y, de forma opcional, una fecha orientativa; además, tu nombre, teléfono y email. Los usamos únicamente para contactarte y gestionar tu solicitud.',
        ),
        p(
          'El motivo de la consulta puede considerarse un dato relativo a la salud. Por eso el formulario no incluye campos de texto libre sobre síntomas y solo pide lo imprescindible.',
        ),
        p(
          'Comunicaciones: solo si marcas la casilla opcional correspondiente, que es independiente de la solicitud.',
        ),
      ],
    },
    {
      title: 'Base jurídica',
      paragraphs: [
        p(
          'Tu consentimiento, que das al marcar la casilla de privacidad antes de enviar la solicitud, y las medidas precontractuales que solicitas. Puedes retirar tu consentimiento en cualquier momento.',
        ),
      ],
    },
    {
      title: 'Destinatarios y encargados',
      paragraphs: [
        p(
          'Los datos se envían por correo electrónico a la clínica a través de un proveedor de correo transaccional que actúa como encargado del tratamiento. La verificación antispam del formulario usa Cloudflare Turnstile. No se ceden datos a terceros salvo obligación legal.',
        ),
      ],
    },
    {
      title: 'Conservación',
      paragraphs: [
        p(
          'La web no guarda las solicitudes en ninguna base de datos. La clínica conserva los correos recibidos durante el plazo que defina y, después, los elimina.',
        ),
      ],
    },
    {
      title: 'Tus derechos',
      paragraphs: [
        p(
          'Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a la clínica, y presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).',
        ),
      ],
    },
  ],
}

export const cookiesPolicy: LegalPage = {
  title: 'Política de cookies',
  description: 'Qué cookies y almacenamiento local usa la web de Valdepodo.',
  updated: UPDATED,
  sections: [
    {
      title: 'Cookies propias',
      paragraphs: [
        p(
          'Esta web no usa cookies propias de analítica ni de publicidad. Las fuentes tipográficas se sirven desde el propio dominio.',
        ),
      ],
    },
    {
      title: 'Almacenamiento en tu navegador',
      paragraphs: [
        p(
          'Usamos el almacenamiento de sesión (se borra al cerrar la pestaña) para no repetir la animación de entrada y para conservar el borrador de la solicitud de cita mientras la rellenas; el borrador no incluye tus consentimientos y se borra al enviarla.',
        ),
        p(
          'Si decides ver el mapa interactivo, recordamos esa preferencia en tu navegador (sin ningún dato personal).',
        ),
      ],
    },
    {
      title: 'Cookies de terceros',
      paragraphs: [
        p(
          'Google Maps: solo se carga si pulsas "Ver mapa interactivo" en la página de contacto; desde ese momento Google puede instalar sus cookies.',
        ),
        p(
          'Cloudflare Turnstile: se carga únicamente en el último paso del formulario de cita para comprobar que el envío lo hace una persona.',
        ),
      ],
    },
  ],
}
