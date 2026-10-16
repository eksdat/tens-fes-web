import { caminhoDoTracado, envelopeEm, escalaDeTempo } from '@/features/simulador/tracado'

const FES = { subida: 2, plato: 6, descida: 2, repouso: 30 }

describe('envoltória do FES no tempo real', () => {
  test.each([
    [1, 'Subida', 0.5, 1, 2],
    [5, 'Platô', 1, 3, 6],
    [9, 'Descida', 0.5, 1, 2],
    [20, 'Repouso', 0, 10, 30],
    [41, 'Subida', 0.5, 1, 2],
  ])('em %s s deve estar em %s', (t, fase, nivel, decorrido, duracao) => {
    const e = envelopeEm(t, FES)
    expect(e.fase).toBe(fase)
    expect(e.nivel).toBeCloseTo(nivel)
    expect(e.decorridoS).toBeCloseTo(decorrido)
    expect(e.duracaoS).toBe(duracao)
  })

  test('deveDarAPosicaoNoCicloDeZeroAUm', () => {
    expect(envelopeEm(0, FES).posicao).toBe(0)
    expect(envelopeEm(20, FES).posicao).toBeCloseTo(0.5)
  })
})

describe('escala de tempo do traçado', () => {
  test('deveMostrarSeisPeriodosNaJanelaEDesacelerarPulsosRapidos', () => {
    const e = escalaDeTempo(80)
    expect(e.janelaMs).toBeCloseTo(75)
    expect(e.lentidao).toBeCloseTo(40)
  })

  test('deveRodarEmTempoRealQuandoOPulsoJaEVisivel', () => {
    expect(escalaDeTempo(2).lentidao).toBe(1)
  })
})

describe('caminho do traçado', () => {
  const base = { frequenciaHz: 80, larguraUs: 100, largura: 300, altura: 80, inicioMs: 0 }

  test('deveSerUmaLinhaRetaComIntensidadeZero', () => {
    expect(caminhoDoTracado({ ...base, intensidadeMa: 0 })).toBe('M0 40 H300')
  })

  test('deveSubirEDescerDoMesmoTamanhoNoPulsoBifasico', () => {
    const d = caminhoDoTracado({ ...base, intensidadeMa: 50 })
    expect(d.startsWith('M0 40')).toBe(true)
    expect(d).toContain('V22')
    expect(d).toContain('V58')
  })

  test('deveCrescerComAIntensidade', () => {
    const alto = caminhoDoTracado({ ...base, intensidadeMa: 100 })
    expect(alto).toContain('V4')
    expect(alto).toContain('V76')
  })

  test('deveDesenharUmPulsoPorPeriodoNaJanela', () => {
    const d = caminhoDoTracado({ ...base, intensidadeMa: 50 })
    expect(d.match(/V22/g)).toHaveLength(6)
  })

  test('deveCorrerComOTempo', () => {
    const agora = caminhoDoTracado({ ...base, intensidadeMa: 50 })
    const depois = caminhoDoTracado({ ...base, intensidadeMa: 50, inicioMs: 3 })
    expect(depois).not.toBe(agora)
  })
})
