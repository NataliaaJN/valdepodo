import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import BookingWizard from '~/components/booking/BookingWizard.vue'
import MapFacade from '~/components/contact/MapFacade.vue'
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

describe('TeamCard (spec 05 §2): disclosure accesible', () => {
  it('el botón alterna aria-expanded y el contenido siempre está en el DOM', async () => {
    const wrapper = await mountSuspended(TeamCard, { props: { member: team[0]! } })
    const button = wrapper.find('button[aria-controls]')
    expect(button.attributes('aria-expanded')).toBe('false')
    const panel = wrapper.find(`#${button.attributes('aria-controls')}`)
    expect(panel.exists()).toBe(true)
    expect(panel.text()).toContain('Breve descripción')
    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(button.attributes('aria-label')).toContain('Ver menos')
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
