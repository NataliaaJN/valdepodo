import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BaseButton from '~/components/base/BaseButton.vue'

describe('BaseButton', () => {
  it('renderiza un <button> con type por defecto', async () => {
    const wrapper = await mountSuspended(BaseButton, { slots: { default: () => 'Enviar' } })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('type')).toBe('button')
    expect(wrapper.text()).toContain('Enviar')
  })

  it('renderiza un enlace cuando recibe `to`', async () => {
    const wrapper = await mountSuspended(BaseButton, {
      props: { to: '/pedir-cita' },
      slots: { default: () => 'Pedir cita' },
    })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/pedir-cita')
  })

  it('en estado de carga se deshabilita y lo anuncia', async () => {
    const wrapper = await mountSuspended(BaseButton, {
      props: { loading: true, loadingLabel: 'Enviando…' },
      slots: { default: () => 'Enviar' },
    })
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('aria-busy')).toBe('true')
    expect(wrapper.text()).toContain('Enviando…')
  })
})
