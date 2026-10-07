import 'vitest'

/** O vitest-axe 0.1 não tipa o matcher para o Vitest 5; declarado aqui. */
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> {
    toHaveNoViolations(): T
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void
  }
}
