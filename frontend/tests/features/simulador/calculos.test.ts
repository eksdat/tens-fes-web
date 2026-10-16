import {
  cargaFaseMicroC,
  ciclo,
  cicloTrabalho,
  classificarValor,
  descreverPulso,
  duracaoTotal,
  limitarAoAparelho,
  mensagensDeSituacao,
  pareceMilissegundos,
  periodoMs,
  tempoOn,
} from '@/features/simulador/calculos'

const CONVENCIONAL = {
  frequencia: { educativa: { minimo: 50, maximo: 100 }, aparelho: { minimo: 60, maximo: 100 } },
  largura: { educativa: { minimo: 50, maximo: 200 }, aparelho: { minimo: 50, maximo: 150 } },
}

describe('contas do guia técnico', () => {
  test('deveCalcularOPeriodoEmMilissegundos', () => {
    expect(periodoMs(80)).toBe(12.5)
    expect(periodoMs(1)).toBe(1000)
  })

  test('deveCalcularACargaDeFaseDoExemploDoGuia', () => {
    expect(cargaFaseMicroC(20, 200)).toBe(4)
  })

  test('deveFecharAsContasDoExercicioA', () => {
    const on = tempoOn({ subida: 2, plato: 6, descida: 2 })
    expect(on).toBe(10)
    expect(ciclo(on, 30)).toBe(40)
    expect(cicloTrabalho(on, 30)).toBe(25)
    expect(duracaoTotal(ciclo(on, 30), 8)).toBe(320)
  })

  test('deveFecharAsContasDoExercicioB', () => {
    const on = tempoOn({ subida: 1, plato: 3, descida: 1 })
    expect(on).toBe(5)
    expect(ciclo(on, 15)).toBe(20)
    expect(cicloTrabalho(on, 15)).toBe(25)
    expect(duracaoTotal(ciclo(on, 15), 6)).toBe(120)
  })
})

describe('classificação de valores', () => {
  test.each([
    [80, 'dentro'],
    [55, 'fora-aparelho'],
    [150, 'fora-aparelho'],
  ] as const)('deveClassificarFrequencia%sComo%s', (valor, esperado) => {
    expect(classificarValor(valor, CONVENCIONAL.frequencia)).toBe(esperado)
  })

  test('deveAvisarForaDaFaixaEducativaMesmoDentroDoAparelho', () => {
    expect(classificarValor(150, { educativa: { minimo: 50, maximo: 100 }, aparelho: { minimo: 0.5, maximo: 250 } })).toBe(
      'fora-educativa',
    )
  })

  test('deveConsiderarDentroQuandoNaoHaFaixaEducativa', () => {
    expect(classificarValor(30, { aparelho: { minimo: 0, maximo: 100 } })).toBe('dentro')
  })

  test('deveTravarNoLimiteDoAparelho', () => {
    expect(limitarAoAparelho(2000, { minimo: 50, maximo: 150 })).toBe(150)
    expect(limitarAoAparelho(10, { minimo: 50, maximo: 150 })).toBe(50)
    expect(limitarAoAparelho(100, { minimo: 50, maximo: 150 })).toBe(100)
  })

  test('deveSuspeitarDeMilissegundosSoQuandoOValorPassaDoAparelhoEDeMil', () => {
    expect(pareceMilissegundos(2000, { minimo: 50, maximo: 500 })).toBe(true)
    expect(pareceMilissegundos(600, { minimo: 50, maximo: 500 })).toBe(false)
    expect(pareceMilissegundos(300, { minimo: 50, maximo: 500 })).toBe(false)
  })
})

describe('mensagens de situação', () => {
  test('devePedirConferenciaDaUnidadeQuandoAlarguraPareceEmMs', () => {
    const mensagens = mensagensDeSituacao({ campo: 'largura', valor: 2000, faixas: CONVENCIONAL.largura })

    expect(mensagens.map((m) => m.texto)).toEqual([
      'Confira a unidade: este campo usa microssegundos (µs).',
      'O valor está fora da faixa documentada para o aparelho selecionado.',
    ])
  })

  test('deveAvisarForaDoAparelho', () => {
    const [mensagem] = mensagensDeSituacao({ campo: 'frequencia', valor: 150, faixas: CONVENCIONAL.frequencia })

    expect(mensagem).toEqual({
      tipo: 'fora-aparelho',
      texto: 'O valor está fora da faixa documentada para o aparelho selecionado.',
    })
  })

  test('deveAvisarForaDaFaixaEducativa', () => {
    const [mensagem] = mensagensDeSituacao({
      campo: 'frequencia',
      valor: 150,
      faixas: { educativa: { minimo: 50, maximo: 100 }, aparelho: { minimo: 0.5, maximo: 250 } },
    })

    expect(mensagem.tipo).toBe('fora-educativa')
  })

  test('deveAvisarInformacaoAusente', () => {
    expect(mensagensDeSituacao({ campo: 'frequencia', valor: null, faixas: CONVENCIONAL.frequencia })).toEqual([
      { tipo: 'informacao-ausente', texto: 'Ainda faltam dados para discutir essa escolha com segurança.' },
    ])
  })

  test('deveFicarEmSilencioDentroDasFaixas', () => {
    expect(mensagensDeSituacao({ campo: 'frequencia', valor: 80, faixas: CONVENCIONAL.frequencia })).toEqual([])
  })
})

describe('descrição textual equivalente', () => {
  test('deveDescreverOPulsoComUnidadesPorExtenso', () => {
    const texto = descreverPulso({
      modalidade: 'TENS',
      modo: 'Convencional',
      frequenciaHz: 80,
      larguraUs: 100,
      intensidadeMa: [20, 0],
    })

    expect(texto).toContain('TENS, modo Convencional.')
    expect(texto).toContain('cada fase dura 100 microssegundos')
    expect(texto).toContain('80 pulsos por segundo, um a cada 12,5 milissegundos')
    expect(texto).toContain('canal 1, 20 miliampères')
    expect(texto).toContain('canal 2, 0 miliampères')
    expect(texto).toContain('Carga por fase no canal 1: 2 microcoulombs')
  })

  test('deveDescreverOCicloDoFes', () => {
    const texto = descreverPulso({
      modalidade: 'FES',
      modo: 'FES',
      frequenciaHz: 35,
      larguraUs: 300,
      intensidadeMa: [0, 0],
      rampas: { subida: 2, plato: 6, descida: 2, repouso: 30 },
    })

    expect(texto).toContain('subida de 2 segundos, platô de 6 segundos, descida de 2 segundos e repouso de 30 segundos')
    expect(texto).toContain('estímulo (ON) de 10 segundos, ciclo de 40 segundos e ciclo de trabalho de 25%')
  })

  test('deveAvisarQueAIntensidadeEmZeroNaoEstimula', () => {
    const texto = descreverPulso({ modalidade: 'TENS', modo: 'Normal', frequenciaHz: 80, larguraUs: 100, intensidadeMa: [0, 0] })

    expect(texto).toContain('Intensidade em zero nos dois canais: não há estimulação.')
  })
})
