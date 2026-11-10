// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['tools/sources/**', 'tools/out/**', 'public/**'],
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      // El formato (incluido el autocierre de etiquetas) lo decide Prettier.
      'vue/html-self-closing': 'off',
    },
  },
)
