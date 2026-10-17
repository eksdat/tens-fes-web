import { APARELHO } from '../aparelho/conteudoAparelho'
import { CASOS_TENS } from '../casos/conteudoCasos'
import { SEGURANCA } from '../seguranca/conteudoSeguranca'
import { M1, R1, R2, R4 } from '../modulo/fontes'
import { VIDEO_DISPOSICAO_DOS_ELETRODOS } from '../modulo/materiais'
import { COMO_COLOCAR, DO_FABRICANTE_ELETRODOS, IDENTIFICACAO, RECOMENDACOES } from '../modulo/textosEletrodos'
import type { Modulo } from '../modulo/tipos'

/** Texto do Guia Técnico, seção 07. Só vira conteúdo publicado depois da revisão docente (prof. Taís). */

export const TENS: Modulo = {
  base: '/tens',
  sigla: 'TENS',
  numero: '01',
  titulo: 'Alívio da dor',
  introducao: 'Conteúdo organizado em torno do alívio da dor. Cada exemplo traz contexto, fonte e limitações.',
  visaoGeral: {
    perguntas: [
      {
        pergunta: 'TENS fortalece músculos?',
        destaque: 'O objetivo do TENS deste módulo é analgesia.',
        detalhe: 'Contração incidental não transforma uma aplicação em treino de força. Para estimulação muscular, estude o módulo FES.',
        acao: { rotulo: 'Ver o módulo FES', para: '/fes' },
      },
      {
        pergunta: 'Serve apenas para dor crônica?',
        destaque: 'A duração da dor não determina sozinha a modalidade.',
        detalhe: 'A indicação depende do contexto.',
        acao: { rotulo: 'Ver os modos e faixas educativas', para: '/tens/parametros' },
      },
      {
        pergunta: 'Pode doer?',
        destaque: 'No convencional, espera-se formigamento forte e confortável.',
        detalhe: 'Não deve haver queimação nem dor.',
        alerta: {
          titulo: 'Interrompa a estimulação',
          texto: 'Ardência ou queimação: verifique pele, eletrodo e contato antes de qualquer retomada.',
        },
      },
      {
        pergunta: 'Qual intensidade em mA?',
        destaque: 'Não há valor único.',
        detalhe: 'Registre o número aplicado e a resposta observada; não copie a intensidade de outra pessoa.',
        acao: { rotulo: 'Abrir os parâmetros', para: '/tens/parametros' },
      },
    ],
    materiais: [
      {
        titulo: 'TENS na dor crônica',
        canal: 'Fisio André Jovedy',
        url: 'https://www.youtube.com/shorts/ykbbICnwbXo',
        formato: 'vídeo curto no YouTube',
      },
    ],
    fontes: [R1, R2],
  },
  aparelho: APARELHO,
  seguranca: SEGURANCA,
  casos: CASOS_TENS,
  eletrodos: {
    modalidade: 'TENS',
    comoColocar: COMO_COLOCAR,
    identificacao: [
      IDENTIFICACAO.codigo,
      'No TENS deste aparelho a forma de onda é quadrática simétrica e bifásica (manual, cap. 8.2.4), sem polaridade fixa. Ligue um pino do cabo a cada eletrodo do par e siga o manual do seu modelo.',
      IDENTIFICACAO.tamanho,
      IDENTIFICACAO.ordem,
    ],
    recomendacoes: RECOMENDACOES,
    doFabricante: DO_FABRICANTE_ELETRODOS,
    materiais: [VIDEO_DISPOSICAO_DOS_ELETRODOS],
    fontes: [M1, R4, R1],
  },
  parametros: {
    titulo: 'Modos de TENS e faixas educativas',
    aviso:
      'As faixas abaixo são referências da literatura para estudo. Não é prescrição: a decisão considera objetivo, resposta, pele, tolerância e recursos do aparelho. Confira o manual antes de reproduzir qualquer preset.',
    modos: [
      {
        nome: 'Convencional',
        faixa: '50–100 Hz; 50–200 µs',
        resposta: 'Analgesia com parestesia forte, confortável e não dolorosa.',
      },
      {
        nome: 'Tipo acupuntura',
        faixa: '2–4 Hz; 100–400 µs',
        resposta: 'Analgesia com contrações rítmicas toleráveis; exige seleção do contexto.',
      },
      {
        nome: 'Burst / rajadas',
        faixa: '2–4 rajadas/s; pulsos internos de 100–200 Hz',
        resposta: 'Grupos de pulsos. Distinga a frequência da rajada e a dos pulsos.',
      },
      {
        nome: 'Modulado',
        faixa: null,
        resposta:
          'Variação programada de frequência, largura e/ou amplitude. Não é uma faixa universal: descreva o que o aparelho realmente modifica.',
      },
    ],
    notaModos:
      'As três primeiras linhas resumem exemplos clássicos descritos em Johnson (R1). O rótulo comercial do programa não garante que os mesmos valores sejam usados.',
    exemplos: [
      {
        titulo: 'Exemplo educativo',
        contexto:
          'Caso fictício: adulto com dor localizada no joelho, já avaliado, pele íntegra e sensibilidade preservada.',
        ajustes: [
          'TENS convencional',
          '80 Hz',
          '100 µs',
          '20 minutos',
          'Intensidade iniciada em zero e ajustada conceitualmente até parestesia forte e confortável',
        ],
        justificativa: 'Praticar o ajuste sensorial e o registro da resposta.',
        fonte: 'Exemplo original da equipe para o simulador; os modos seguem Johnson (R1).',
        limitacoes: 'O tempo de 20 minutos foi escolhido para este exercício; não é regra clínica.',
      },
    ],
    camposObrigatorios: [
      'Modalidade',
      'Modo',
      'Frequência',
      'Largura de fase/pulso, conforme o manual',
      'Intensidade por canal',
      'Duração',
      'Localização',
      'Resposta sensorial',
      'Avaliação da dor',
    ],
    foraDoEscopo:
      'TENS intenso existe na literatura, mas não é preset deste módulo. Sua aplicação exige contexto específico; não se ensina a buscar dor como meta do TENS convencional.',
    doFabricante: {
      linhas: [
        'Intensidade: 0–100 mA por canal, com controle individual (carga de 1000 Ω ±20%, tensão constante).',
        'TENS Normal: 0,5–250 Hz; fase do pulso de 50–500 µs.',
        'TENS Burst: rajada de 250 Hz modulada a 2 Hz; fase de 50–500 µs.',
        'TENS Convencional: 60–100 Hz; fase de 50–150 µs.',
        'TENS Acupuntura: 1–10 Hz; fase de 150–250 µs.',
        'TENS Misto: 1–150 Hz, ciclagem de 1–20 s; fase de 50–500 µs.',
        'TENS VIF (variação de fase e frequência): 10–100 Hz; fase de 50–225 µs.',
        'TENS VF (variação de frequência): 10–100 Hz; fase de 50–500 µs.',
        'Tempo de tratamento: 1–60 min. Valores com tolerância de ±10%.',
      ],
      fonte: 'Manual do Neurodyn Portable TENS/FES (M1), cap. 8.2.4. Vale para esse modelo; confira o manual do seu aparelho.',
    },
    fontes: [R1, M1],
  },
}
