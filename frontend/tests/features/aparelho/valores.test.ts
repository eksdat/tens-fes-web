import { descreverControle, mensagemDeAjuste } from '@/features/aparelho/valores'
import { ESTADO_INICIAL, type EstadoDoAparelho } from '@/features/aparelho/estado'

const estado = (parcial: Partial<EstadoDoAparelho> = {}): EstadoDoAparelho => ({ ...ESTADO_INICIAL, ...parcial })

describe('valor e unidade de cada controle', () => {
  test('deveMostrarOsParametrosNosControlesQueOsAjustam', () => {
    expect(descreverControle(3, estado())).toMatchObject({ unidade: 'Sem unidade', valor: 'TENS, modo Convencional' })
    expect(descreverControle(4, estado())).toMatchObject({ unidade: 'Hz e µs', valor: '80 Hz · 100 µs' })
    expect(descreverControle(7, estado({ intensidade1: 18, intensidade2: 0 }))).toMatchObject({
      unidade: 'mA',
      valor: 'Canal 1: 18 mA · Canal 2: 0 mA',
    })
  })

  test('deveUsarVirgulaDecimalNoValor', () => {
    expect(descreverControle(4, estado({ frequenciaHz: 0.5 })).valor).toBe('0,5 Hz · 100 µs')
  })

  test('deveSeguirOEstadoDaSimulacaoNoStartStopENoIndicadorDeSaida', () => {
    expect(descreverControle(6, estado())).toMatchObject({ valor: 'Parado', estado: 'Simulação pausada' })
    expect(descreverControle(6, estado({ emExecucao: true }))).toMatchObject({ valor: 'Em execução', estado: 'Simulação em execução' })
    expect(descreverControle(8, estado({ emExecucao: true, intensidade1: 10 })).valor).toBe('Corrente sendo emitida')
    expect(descreverControle(8, estado({ emExecucao: true })).valor).toBe('Sem corrente')
    expect(descreverControle(8, estado({ intensidade1: 10 })).valor).toBe('Sem corrente')
  })

  test('deveDizerQueNaoSimulaOQueNaoTemValor', () => {
    for (const numero of [2, 5]) expect(descreverControle(numero, estado()).valor).toBe('Não simulado')
    for (const numero of [9, 10, 11, 12, 13, 14]) {
      expect(descreverControle(numero, estado())).toMatchObject({ unidade: 'Sem unidade', valor: 'Peça física, sem valor' })
    }
  })

  test('deveDarUnidadeValorEEstadoParaOsQuatorzeControles', () => {
    for (let numero = 1; numero <= 14; numero++) {
      const d = descreverControle(numero, estado())
      expect(d.unidade.length).toBeGreaterThan(0)
      expect(d.valor.length).toBeGreaterThan(0)
      expect(d.estado.length).toBeGreaterThan(0)
    }
  })
})

describe('mensagens prontas do guia ao ajustar', () => {
  test.each([
    ['frequencia', 80, 'hertz', 'Frequência alterada para 80 hertz.'],
    ['largura', 100, 'microssegundos', 'Largura de pulso alterada para 100 microssegundos.'],
    ['intensidade1', 18, 'miliampères', 'Intensidade do canal 1 alterada para 18 miliampères.'],
    ['intensidade2', 7.5, 'miliampères', 'Intensidade do canal 2 alterada para 7,5 miliampères.'],
    ['subida', 2, 'segundos', 'Rampa de subida alterada para 2 segundos.'],
    ['plato', 6, 'segundos', 'Platô alterado para 6 segundos.'],
    ['descida', 2, 'segundos', 'Rampa de descida alterada para 2 segundos.'],
    ['repouso', 30, 'segundos', 'Repouso alterado para 30 segundos.'],
  ] as const)('deveAnunciar %s', (campo, valor, extenso, esperado) => {
    expect(mensagemDeAjuste(campo, valor, extenso)).toBe(esperado)
  })

  test('deveAnunciarIntensidadeZeroComAFraseDoGuia', () => {
    expect(mensagemDeAjuste('intensidade1', 0, 'miliampères')).toBe('Canal 1: intensidade zero.')
    expect(mensagemDeAjuste('intensidade2', 0, 'miliampères')).toBe('Canal 2: intensidade zero.')
  })

  test('deveUsarSingularQuandoOValorEUm', () => {
    expect(mensagemDeAjuste('subida', 1, 'segundos')).toBe('Rampa de subida alterada para 1 segundo.')
    expect(mensagemDeAjuste('frequencia', 1, 'hertz')).toBe('Frequência alterada para 1 hertz.')
  })
})
