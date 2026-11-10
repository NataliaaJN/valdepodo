/** `true` si el usuario prefiere movimiento reducido. Reactivo a cambios del sistema. */
export function useReducedMotion() {
  const reduced = ref(false)
  let query: MediaQueryList | undefined

  const update = () => {
    reduced.value = query?.matches ?? false
  }

  onMounted(() => {
    query = window.matchMedia('(prefers-reduced-motion: reduce)')
    update()
    query.addEventListener('change', update)
  })

  onBeforeUnmount(() => query?.removeEventListener('change', update))

  return readonly(reduced)
}
