import { describe, expect, it } from 'vitest'
import { FICHAS_CASOS } from '@/features/casos/conteudoCasos'
import { interpretarRelato } from '@/features/casos/interpretarRelato'

describe('interpretarRelato', () => {
  it('identifica a ficha de fibromialgia e reconhece a tarefa explícita', () => {
    const resultado = interpretarRelato('Pessoa com fibromialgia relata dor ao caminhar.', [FICHAS_CASOS[0]])
    expect(resultado.ficha?.id).toBe('fast-fibromialgia')
    expect(resultado.faltantes).not.toContain('tarefa de movimento definida')
  })

  it('não abre ficha de AVC quando faltam fase e tarefa', () => {
    const resultado = interpretarRelato('Paciente teve AVC e sente fraqueza.', [FICHAS_CASOS[1]])
    expect(resultado.ficha?.id).toBe('pmc9773873-dorsiflexao')
    expect(resultado.faltantes).toEqual(expect.arrayContaining(['fase pós-AVC subagudo confirmada', 'tarefa de dorsiflexão definida']))
  })

  it('mantém relato desconhecido em confirmação explícita', () => {
    expect(interpretarRelato('Dor sem contexto.', FICHAS_CASOS).ficha).toBeUndefined()
  })

  it.each([
    'Tenho diagnóstico de fibromialgia. Minha dor piora quando ando.',
    'FIBROMIALGIA. Sinto dor ao subir escadas.',
    'Tenho fibromialgia, sem febre. Caminhar me dá dor.',
  ])('reconhece o cenário FAST em linguagem comum: %s', (relato) => {
    expect(interpretarRelato(relato, [FICHAS_CASOS[0]]).faltantes).toEqual([])
  })

  it.each([
    'Dor ao caminhar no bairro, sem diagnóstico informado.',
    'Não tenho fibromialgia. Sinto dor ao caminhar.',
    'Suspeita de fibromialgia. Sinto dor ao caminhar.',
  ])('exige uma população identificada: %s', (relato) => {
    expect(interpretarRelato(relato, [FICHAS_CASOS[0]]).ficha).toBeUndefined()
  })

  it('reconhece fase subaguda e não confunde lado não parético com uma negação', () => {
    const resultado = interpretarRelato('AVC em fase subaguda. Quero levantar a ponta do pé. Posso acionar com o lado não parético.', [FICHAS_CASOS[1]])
    expect(resultado.faltantes).toEqual([])
  })

  it('mantém o acionamento pendente quando o relato diz que ele não está disponível', () => {
    const resultado = interpretarRelato('AVC subagudo. Treino de dorsiflexão. Acionamento contralateral indisponível.', [FICHAS_CASOS[1]])
    expect(resultado.faltantes).toContain('controle/acionamento contralateral disponível')
  })

  it.each([
    'Minha mãe tem fibromialgia. Eu sinto dor ao caminhar.',
    'Minha médica descartou fibromialgia. Sinto dor quando ando.',
    'Fibromialgia ainda em investigação. Sinto dor ao subir escadas.',
    'Li sobre fibromialgia. Tenho dor ao caminhar.',
    'Histórico familiar de acidente vascular cerebral. Quero treinar dorsiflexão.',
  ])('não associa condição de terceiro ou não estabelecida: %s', (relato) => {
    expect(interpretarRelato(relato, FICHAS_CASOS).ficha).toBeUndefined()
  })

  it.each([
    'Fibromialgia confirmada. Caminho normalmente. A dor aparece em repouso.',
    'Fibromialgia confirmada. Sinto dor em repouso e consigo andar normalmente.',
    'Tenho fibromialgia. Quando subo escadas não sinto dor.',
    'Tenho fibromialgia. A caminhada é sem dor.',
  ])('mantém a relação da dor com a tarefa pendente: %s', (relato) => {
    expect(interpretarRelato(relato, FICHAS_CASOS).faltantes).toContain('dor durante a tarefa registrada')
  })

  it.each([
    'Tenho fibromialgia. Ao subir escadas, sinto dor.',
    'Tenho fibromialgia. A caminhada faz a dor piorar.',
  ])('reconhece dor durante uma atividade descrita em ordem natural: %s', (relato) => {
    expect(interpretarRelato(relato, FICHAS_CASOS).faltantes).toEqual([])
  })

  it.each([
    'AVC há seis anos. Quero levantar a ponta do pé. Tenho acionamento contralateral.',
    'AVC. A fase subaguda ainda não foi confirmada. Preciso treinar dorsiflexão.',
  ])('mantém a fase pendente quando o texto não a estabelece: %s', (relato) => {
    expect(interpretarRelato(relato, FICHAS_CASOS).faltantes).toContain('fase pós-AVC subagudo confirmada')
  })

  it.each(['', ' \n\t... ???', '📝 ### •', 'dx: FM\n marcha: ok\n dor 7/10'])(
    'deixa sem ficha quando a entrada não estabelece a condição: %j',
    (relato) => expect(interpretarRelato(relato, FICHAS_CASOS).ficha).toBeUndefined(),
  )

  it.each([
    'Do I have fibromyalgia? It hurts when I walk.',
    'Stroke recovery. My toes drag when I walk.',
    'No tengo fibromialgia. Sinto dor ao caminhar.',
    'Sin fibromialgia. La persona siente dolor al caminar.',
    'Fibromialgia? Sinto dor ao caminhar.',
    'Diagnóstico: fibromialgia ???\nDor ao subir escadas.',
  ])('não trata hipótese ou negação como condição confirmada: %j', (relato) => {
    expect(interpretarRelato(relato, FICHAS_CASOS).ficha).toBeUndefined()
  })

  it('mantém dor e tarefa pendentes quando as anotações não estabelecem a relação', () => {
    const resultado = interpretarRelato('Diagnóstico: fibromialgia\n• Caminhada\n• Dor: 7/10', FICHAS_CASOS)
    expect(resultado.faltantes).toContain('dor durante a tarefa registrada')
  })

  it('reconhece os critérios quando a quebra é apenas visual na mesma frase', () => {
    expect(interpretarRelato('Fibromialgia confirmada.\nDor ao subir\n   escadas.', FICHAS_CASOS).faltantes).toEqual([])
  })

  it('mantém a fase pendente quando só há a palavra quebrada em linhas', () => {
    expect(interpretarRelato('AVC\nsuba-\ngudo\nDorsiflexão. Controle contralateral.', FICHAS_CASOS).faltantes)
      .toContain('fase pós-AVC subagudo confirmada')
  })
})
