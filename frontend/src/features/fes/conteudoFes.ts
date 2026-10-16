import { APARELHO } from '../aparelho/conteudoAparelho'
import { CASOS_FES } from '../casos/conteudoCasos'
import { SEGURANCA } from '../seguranca/conteudoSeguranca'
import { M1, R3, R4, R5 } from '../modulo/fontes'
import { VIDEO_DISPOSICAO_DOS_ELETRODOS } from '../modulo/materiais'
import { COMO_COLOCAR, DO_FABRICANTE_ELETRODOS, IDENTIFICACAO, RECOMENDACOES } from '../modulo/textosEletrodos'
import type { Modulo } from '../modulo/tipos'

/** Texto do Guia Técnico, seção 08. Só vira conteúdo publicado depois da revisão docente (prof. Taís). */

export const FES: Modulo = {
  base: '/fes',
  sigla: 'FES',
  numero: '02',
  titulo: 'Movimento e função',
  introducao:
    'Conteúdo organizado em torno do movimento e da função. A nomenclatura e os recursos devem corresponder ao manual do modelo.',
  visaoGeral: {
    perguntas: [
      {
        pergunta: 'FES e NMES são a mesma coisa?',
        destaque: 'Não. A diferença está na tarefa.',
        detalhe:
          'A NMES produz contração para ativação e treino muscular, como contrações isoladas do quadríceps. A FES organiza a estimulação no tempo de uma atividade, como o balanço da marcha.',
        acao: { rotulo: 'Ver os exercícios A e B', para: '/fes/parametros' },
      },
      {
        pergunta: 'O modo “FES” do aparelho é FES funcional?',
        destaque: 'Nem sempre.',
        detalhe:
          'No aparelho, “FES” pode ser só o nome comercial de um programa muscular. O nome do modo não garante sincronização com uma tarefa.',
        acao: { rotulo: 'Ver o aparelho', para: '/fes/aparelho' },
      },
      {
        pergunta: 'Posso aumentar a corrente se o músculo não contrai?',
        destaque: 'Não aumente indefinidamente.',
        detalhe:
          'A ausência de contração não autoriza aumentar a corrente. Revise posição, contato, fadiga e o contexto: fraqueza por lesão central e desnervação periférica não são equivalentes.',
        alerta: {
          titulo: 'Interrompa a estimulação',
          texto: 'Ardência, queimação ou dor inesperada: interrompa a saída e verifique pele, eletrodo e contato.',
        },
        acao: { rotulo: 'Ver segurança', para: '/fes/seguranca' },
      },
      {
        pergunta: 'Qual intensidade em mA?',
        destaque: 'Não há valor único.',
        detalhe: 'Ajuste à contração e à tarefa, dentro da tolerância e da segurança. Registre o número aplicado e a resposta observada.',
        acao: { rotulo: 'Ver os parâmetros motores', para: '/fes/parametros' },
      },
      {
        pergunta: 'Os protocolos valem para qualquer pessoa?',
        destaque: 'Não. Não transfira protocolos entre populações.',
        detalhe:
          'A revisão de Nussbaum et al. (R3) aborda a NMES em diferentes condições, e os protocolos não devem ser transferidos indiscriminadamente.',
      },
    ],
    fontes: [R3, R5, M1],
  },
  aparelho: APARELHO,
  seguranca: SEGURANCA,
  casos: CASOS_FES,
  eletrodos: {
    modalidade: 'FES',
    comoColocar: COMO_COLOCAR,
    identificacao: [
      IDENTIFICACAO.codigo,
      'No FES, siga o manual do seu modelo sobre os pinos vermelho e preto do cabo e não presuma polaridade. Ligue um pino a cada eletrodo do par.',
      IDENTIFICACAO.tamanho,
      IDENTIFICACAO.ordem,
    ],
    recomendacoes: [
      ...RECOMENDACOES,
      'A ausência de contração não autoriza aumentar a corrente indefinidamente: revise posição, contato e fadiga antes.',
    ],
    doFabricante: DO_FABRICANTE_ELETRODOS,
    materiais: [VIDEO_DISPOSICAO_DOS_ELETRODOS],
    fontes: [M1, R4, R3, R5],
  },
  parametros: {
    titulo: 'Parâmetros motores: a relação entre ajuste e tarefa',
    aviso:
      'As referências abaixo são faixas introdutórias sintetizadas para ensino, sem prescrição universal. Não correspondem a um protocolo único de Nussbaum et al. (R3).',
    campos: [
      {
        nome: 'Frequência',
        faixa: 'Cerca de 20–50 Hz',
        texto:
          'Faixas aproximadas usadas em muitos contextos motores; protocolos podem empregar outros valores. Busque contração útil sem aumentar a fadiga desnecessariamente.',
      },
      {
        nome: 'Duração de fase/pulso',
        faixa: 'Frequentemente 200–400 µs',
        texto:
          'Valores de centenas de microssegundos aparecem em aplicações de músculos inervados. Confira a convenção do aparelho.',
      },
      {
        nome: 'Amplitude',
        faixa: null,
        texto:
          'Ajuste à contração e à tarefa, dentro da tolerância e da segurança. Nenhum valor em mA serve para todos.',
      },
      {
        nome: 'Trabalho e repouso',
        faixa: null,
        texto:
          'A relação depende do objetivo, da fadiga e da tarefa. Na marcha, o acionamento segue eventos do passo.',
      },
      {
        nome: 'Rampas',
        faixa: null,
        texto: 'Transições graduais podem aumentar o conforto. Rampas longas podem atrasar uma tarefa rápida.',
      },
    ],
    exemplos: [
      {
        titulo: 'Exercício A: ativação de quadríceps',
        contexto: 'Caso fictício de ativação do quadríceps em exercício isolado.',
        ajustes: ['35 Hz', '300 µs', 'Subida 2 s', 'Platô 6 s', 'Descida 2 s', 'Repouso 30 s', '8 ciclos'],
        calculo: [
          'Período com estímulo: 10 s, incluindo as rampas.',
          'Cada ciclo: 40 s.',
          'Exercício total: 320 s (5 min 20 s).',
        ],
        classificacao: 'NMES, pois não há tarefa funcional integrada.',
        justificativa: 'A intensidade é ajustada à contração tolerável no caso fictício.',
        fonte: 'Exercício original da equipe para o simulador, com faixas sintetizadas para ensino (R3).',
        limitacoes: 'Os valores foram escolhidos para este exercício; não são protocolo clínico nem prescrição.',
      },
      {
        titulo: 'Exercício B: abertura da mão',
        contexto: 'Caso fictício de abertura da mão para soltar um objeto leve, com assistência prevista.',
        ajustes: ['30 Hz', '250 µs', 'Subida 1 s', 'Platô 3 s', 'Descida 1 s', 'Repouso 15 s', '6 ciclos'],
        calculo: [
          'Período com estímulo: 5 s, incluindo as rampas.',
          'Cada ciclo: 20 s.',
          'Exercício total: 120 s (2 min).',
        ],
        tarefa:
          'Na fase ativa, abrir a mão e soltar um objeto leve, com assistência prevista. Há tarefa explícita, o que permite discutir FES. Avalie a seletividade: extensão útil, conforto e ausência de postura indesejada.',
        fonte: 'Exercício original da equipe para o simulador, com faixas sintetizadas para ensino (R3).',
        limitacoes: 'Os valores foram escolhidos para este exercício; não são protocolo clínico nem prescrição.',
      },
    ],
    doFabricante: {
      linhas: [
        'Intensidade: 0–100 mA por canal, com controle individual (carga de 1000 Ω ±20%).',
        'Frequência: 0,5–250 Hz. Duração de fase: 50–500 µs.',
        'VIF (variação de fase e frequência): 10–100 Hz; fase de 50–225 µs.',
        'Modos: FES Sinc, FES Rec, VIF Sinc e VIF Rec (síncrono e recíproco nos canais 1 e 2).',
        'Rampa: subida (Rise) de 1–20 s, contração (On) de 1–60 s, descida (Decay) de 1–20 s e relaxamento (Off) de 1–60 s.',
        'Tempo de tratamento: 1–60 min. Valores com tolerância de ±10%.',
      ],
      fonte: 'Manual do Neurodyn Portable TENS/FES (M1), cap. 8.2.5. Vale para esse modelo; confira o manual do seu aparelho.',
    },
    fontes: [R3, M1],
  },
}
