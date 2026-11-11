import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import BookingWizard from '~/components/booking/BookingWizard.vue'
import MapFacade from '~/components/contact/MapFacade.vue'
import CtaBlock from '~/components/sections/CtaBlock.vue'
import TeamCard from '~/components/team/TeamCard.vue'
import { team } from '~/data/team'

registerEndpoint('/api/cita/token', () => ({ token: 'token-de-prueba' }))

afterEach(() => {
  sessionStorage.clear()
  localStorage.clear()
})

describe('BookingWizard (spec 06)', () => {
  it('preselecciona el motivo de ?motivo= sin saltar el paso', async () => {
    const wrapper = await mountSuspended(BookingWizard, { route: '/pedir-cita?motivo=pie-diabetico' })
    await flushPromises()
    expect(wrapper.text()).toContain('Paso 1 de 5')
    const checked = wrapper.find<HTMLInputElement>('input[type="radio"]:checked')
    expect(checked.exists()).toBe(true)
    expect(checked.element.closest('label')?.textContent).toContain('Pie diabético')
  })

  it('elegir una opción no avanza; continuar sin elegir muestra el error', async () => {
    const wrapper = await mountSuspended(BookingWizard, { route: '/pedir-cita' })
    await flushPromises()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('Elige el motivo de tu consulta.')
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)

    await wrapper.findAll('input[type="radio"]')[0]!.setValue(true)
    await flushPromises()
    expect(wrapper.text()).toContain('Paso 1 de 5')
  })

  it('un paso posterior sin datos redirige al primero incompleto', async () => {
    const wrapper = await mountSuspended(BookingWizard, { route: '/pedir-cita?paso=4' })
    await flushPromises()
    expect(wrapper.text()).toContain('Paso 1 de 5')
  })

  it('guarda el borrador en sessionStorage sin consentimientos', async () => {
    const wrapper = await mountSuspended(BookingWizard, { route: '/pedir-cita' })
    await flushPromises()
    await wrapper.findAll('input[type="radio"]')[1]!.setValue(true)
    await flushPromises()
    const saved = JSON.parse(sessionStorage.getItem('vp-booking-draft') ?? '{}')
    expect(saved.motivo).toBe('plantillas-personalizadas')
    expect(saved).not.toHaveProperty('privacidad')
    expect(localStorage.length).toBe(0)
  })

  it('no muestra la confirmación sin respuesta del servidor', async () => {
    const wrapper = await mountSuspended(BookingWizard, { route: '/pedir-cita' })
    await flushPromises()
    expect(wrapper.text()).not.toContain('Hemos recibido tu')
  })
})

describe('TeamCard (spec 05 §2): tarjeta compacta', () => {
  it('muestra nombre y cargo y mantiene siempre en el DOM la información ampliada', async () => {
    const wrapper = await mountSuspended(TeamCard, { props: { member: team[0]! } })
    expect(wrapper.find('h3').text()).toContain('Nombre Apellido')
    expect(wrapper.find('.role').text()).toContain('Cargo')
    // Plegada en reposo (solo visualmente): los lectores de pantalla la leen igual
    expect(wrapper.find('.more').text()).toContain('Breve descripción')
    expect(wrapper.find('.tags').attributes('aria-label')).toBe('Especialidades')
  })

  it('es enfocable con el teclado y se nombra por el profesional', async () => {
    const wrapper = await mountSuspended(TeamCard, { props: { member: team[0]! } })
    const card = wrapper.find('article')
    expect(card.attributes('tabindex')).toBe('0')
    expect(card.attributes('aria-labelledby')).toBe(wrapper.find('h3').attributes('id'))
  })

  it('solo muestra el enlace a LinkedIn si la persona lo autoriza', async () => {
    const member = { ...team[0]!, linkedin: 'https://www.linkedin.com/in/ejemplo' }
    const wrapper = await mountSuspended(TeamCard, { props: { member } })
    expect(wrapper.find('a.social').attributes('href')).toBe('https://www.linkedin.com/in/ejemplo')
    const without = await mountSuspended(TeamCard, { props: { member: team[0]! } })
    expect(without.find('a.social').exists()).toBe(false)
  })
})

describe('CtaBlock (pre-footer global)', () => {
  it('lleva a la solicitud de cita de Contacto', async () => {
    const wrapper = await mountSuspended(CtaBlock)
    expect(wrapper.find('h2').text()).toContain('Da el próximo paso')
    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/contacto#cita')
    expect(link.text()).toContain('Pedir cita')
  })
})

describe('MapFacade (spec 07 §3)', () => {
  it('no carga el iframe de Google hasta que se pide', async () => {
    const wrapper = await mountSuspended(MapFacade)
    expect(wrapper.find('iframe').exists()).toBe(false)
    expect(wrapper.text()).toContain('Google puede instalar cookies')
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('iframe').exists()).toBe(true)
    expect(localStorage.getItem('vp-map-consent')).toBe('1')
  })
})
