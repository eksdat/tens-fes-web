import {
  aplicarPreferencias,
  lerPreferencias,
  PADRAO,
  salvarPreferencias,
} from '@/shared/acessibilidade/preferencias'

afterEach(() => {
  vi.unstubAllGlobals()
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('data-contraste')
  document.documentElement.removeAttribute('data-movimento')
})

test('deveUsarPadraoQuandoNaoHaPreferenciaSalva', () => {
  expect(lerPreferencias()).toEqual(PADRAO)
})

test('deveRecuperarPreferenciaSalva', () => {
  salvarPreferencias({ tamanho: 'grande', altoContraste: true, semMovimento: false })

  expect(lerPreferencias()).toEqual({ tamanho: 'grande', altoContraste: true, semMovimento: false })
})

test('deveIgnorarValorSalvoInvalido', () => {
  localStorage.setItem('fisiotech.acessibilidade', '{"tamanho":"gigante","altoContraste":"sim"}')

  expect(lerPreferencias()).toEqual(PADRAO)
})

test('deveIgnorarJsonCorrompido', () => {
  localStorage.setItem('fisiotech.acessibilidade', '{quebrado')

  expect(lerPreferencias()).toEqual(PADRAO)
})

test('deveSeguirPreferenciaDoSistemaQuandoNadaFoiSalvo', () => {
  vi.stubGlobal('matchMedia', (consulta: string) => ({
    matches: consulta.includes('prefers-contrast') || consulta.includes('prefers-reduced-motion'),
  }))

  expect(lerPreferencias()).toEqual({ tamanho: 'normal', altoContraste: true, semMovimento: true })
})

test('deveAplicarPreferenciasNaRaizDoDocumento', () => {
  aplicarPreferencias({ tamanho: 'muito-grande', altoContraste: true, semMovimento: true })

  const raiz = document.documentElement
  expect(raiz.style.fontSize).toBe('150%')
  expect(raiz.dataset.contraste).toBe('alto')
  expect(raiz.dataset.movimento).toBe('reduzido')
})

test('deveRemoverMarcasAoVoltarAoPadrao', () => {
  aplicarPreferencias({ tamanho: 'grande', altoContraste: true, semMovimento: true })
  aplicarPreferencias(PADRAO)

  const raiz = document.documentElement
  expect(raiz.style.fontSize).toBe('100%')
  expect(raiz.dataset.contraste).toBeUndefined()
  expect(raiz.dataset.movimento).toBeUndefined()
})

test('deveFuncionarSemLocalStorage', () => {
  vi.stubGlobal('localStorage', {
    getItem: () => {
      throw new Error('bloqueado')
    },
    setItem: () => {
      throw new Error('bloqueado')
    },
  })

  expect(lerPreferencias()).toEqual(PADRAO)
  expect(() => salvarPreferencias(PADRAO)).not.toThrow()
})
