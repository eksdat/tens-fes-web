/**
 * Montagens de eletrodos do Guia Técnico (seções 11A a 11E) e regiões acrescentadas pela equipe. Os eletrodos ficam sobre
 * uma ilustração anatômica, em coordenadas da placa e em escala (um eletrodo de 5 cm mede LADO_ELETRODO). A posição final
 * depende de avaliação e teste motor. O texto só vira conteúdo publicado depois da revisão docente.
 */

export type Modalidade = 'TENS' | 'FES'

export type Eletrodo = {
  codigo: '1A' | '1B' | '2A' | '2B'
  canal: 1 | 2
  /** Posição em palavras: é a versão do desenho para quem não o vê. */
  posicao: string
  /** Centro do eletrodo, em coordenadas da placa anatômica. */
  x: number
  y: number
}

/** Lado do corpo da pessoa (não da imagem). Bilateral: um par de cada lado; central: sobre a linha média. */
export type Lado = 'esquerdo' | 'direito' | 'bilateral' | 'central'

export type CaracteristicasEletrodos = { tipo: string; larguraCm: number; alturaCm: number }

/** Eletrodo que acompanha o Neurodyn Portable (manual M1, cap. 8.3); o desenho usa esse tamanho (LADO_ELETRODO). */
export const ELETRODO_DO_APARELHO: CaracteristicasEletrodos = {
  tipo: 'Borracha condutiva',
  larguraCm: 5,
  alturaCm: 5,
}

export type Montagem = {
  id: 'lombar' | 'joelho' | 'quadriceps' | 'tibial-anterior' | 'extensores-punho' | 'ombro' | 'abdomen' | 'isquiotibiais'
  modalidade: Modalidade
  nome: string
  vista: string
  lado: Lado
  caracteristicasEletrodos: CaracteristicasEletrodos
  objetivo: string
  marcos: string
  montagem: string[]
  resposta: string
  cuidados: string[]
  legendaDesenho: string[]
  descricao: string
  fonte: string
  recorte: { x: number; y: number; w: number; h: number }
  eletrodos: Eletrodo[]
  /** Ponto clicável no corpo, em coordenadas da placa. */
  ponto: { figura: 'frente' | 'costas'; x: number; y: number }
}

/** Placa anatômica em SVG: músculos de frente e de costas. Ilustração de OpenStax, redesenhada por Tomáš Kebert e umimeto.org (CC BY-SA 4.0). */
export const PLACA = { largura: 406.99, altura: 354.43 }

/** Trecho da placa que mostra o corpo inteiro de frente e de costas. */
export const FIGURAS = {
  frente: { x: 8, y: 8, w: 190, h: 330 },
  costas: { x: 230, y: 8, w: 170, h: 330 },
}

/** Lado de um eletrodo de 5 cm × 5 cm na escala da placa (o corpo mede cerca de 325 unidades, ou 175 cm). */
export const LADO_ELETRODO = 9.3

export const CREDITO_DA_ILUSTRACAO =
  'Ilustração anatômica: OpenStax, redesenhada por Tomáš Kebert e umimeto.org, licença CC BY-SA 4.0 (creativecommons.org/licenses/by-sa/4.0). Recortada e com eletrodos acrescentados.'

export const MONTAGENS: Montagem[] = [
  {
    id: 'lombar',
    lado: 'bilateral',
    caracteristicasEletrodos: ELETRODO_DO_APARELHO,
    modalidade: 'TENS',
    nome: 'Região lombar',
    vista: 'Costas (posterior)',
    objetivo: 'Exemplo sensorial para dor lombar localizada já avaliada.',
    marcos: 'Linha da coluna e musculatura paravertebral lombar.',
    montagem: [
      'Dois pares longitudinais, um em cada lado da região dolorosa; nenhum par atravessa o tórax.',
      'Canal 1: 1A superior e 1B inferior, à esquerda da imagem.',
      'Canal 2: 2A superior e 2B inferior, à direita.',
      'Coloque sobre tecidos laterais à linha óssea central e ajuste à área sintomática. Não há distância fixa em centímetros válida para todos.',
    ],
    resposta: 'Parestesia confortável na área selecionada.',
    cuidados: [
      'Verifique pele e sensibilidade; investigue sinais de alerta.',
      'Gestação exige avaliação específica, sem liberar este exemplo automaticamente.',
    ],
    legendaDesenho: [
      'Área clara no centro: fáscia toracolombar, sobre a coluna lombar',
      'Músculos nas laterais: latíssimo do dorso',
      'Embaixo: glúteos e crista ilíaca (osso do quadril)',
      'Os eretores da espinha (paravertebrais) ficam sob a fáscia, ao lado da coluna',
    ],
    descricao:
      'Costas em esquema. Quatro eletrodos na região lombar, organizados em duas colunas laterais à coluna vertebral. Cada coluna contém os dois eletrodos do mesmo canal.',
    fonte:
      'Prancha autoral que ilustra montagem regional de TENS; fundamento geral em Johnson (R1). Não representa protocolo validado para toda lombalgia.',
    recorte: { x: 275, y: 104, w: 80, h: 96 },
    eletrodos: [
      { codigo: '1A', canal: 1, posicao: 'Superior, à esquerda da imagem', x: 302, y: 126 },
      { codigo: '1B', canal: 1, posicao: 'Inferior, à esquerda da imagem', x: 302, y: 148 },
      { codigo: '2A', canal: 2, posicao: 'Superior, à direita da imagem', x: 328, y: 126 },
      { codigo: '2B', canal: 2, posicao: 'Inferior, à direita da imagem', x: 328, y: 148 },
    ],
    ponto: { figura: 'costas', x: 315, y: 152 },
  },
  {
    id: 'joelho',
    lado: 'esquerdo',
    caracteristicasEletrodos: ELETRODO_DO_APARELHO,
    modalidade: 'TENS',
    nome: 'Joelho',
    vista: 'Frente (anterior), joelho esquerdo',
    objetivo: 'Ensinar cobertura sensorial ao redor de uma região dolorosa do joelho.',
    marcos: 'Patela central, região superior medial e inferior lateral.',
    montagem: [
      '1A e 1B pertencem ao mesmo canal, em pele íntegra ao redor da área dolorosa.',
      'Modifique a localização conforme o mapa da dor e o conforto; não coloque automaticamente sobre incisão, lesão cutânea ou área com sensibilidade comprometida.',
    ],
    resposta:
      'Formigamento confortável na região-alvo. Contração vigorosa não é a meta deste exemplo de TENS convencional.',
    cuidados: [
      'A prancha não estabelece indicação para toda dor de joelho.',
      'Fotografias de evolução devem preservar privacidade e identificar lado e posição.',
    ],
    legendaDesenho: [
      'Oval central: patela',
      'Acima: tendão do quadríceps e vasto medial',
      'Abaixo: ligamento patelar',
    ],
    descricao:
      'Joelho esquerdo em vista anterior. Patela ao centro. Um eletrodo acima e medial à patela e outro abaixo e lateral à patela, formando o canal 1.',
    fonte:
      'Prancha autoral para ensino de montagem regional, apoiada nos princípios de Johnson (R1). A revisão de TENS (R2) não valida esta montagem específica.',
    recorte: { x: 96, y: 221, w: 40, h: 48 },
    eletrodos: [
      { codigo: '1A', canal: 1, posicao: 'Acima e medial à patela', x: 109, y: 235 },
      { codigo: '1B', canal: 1, posicao: 'Abaixo e lateral à patela', x: 123, y: 258 },
    ],
    ponto: { figura: 'frente', x: 116, y: 246 },
  },
  {
    id: 'quadriceps',
    lado: 'direito',
    caracteristicasEletrodos: ELETRODO_DO_APARELHO,
    modalidade: 'FES',
    nome: 'Quadríceps',
    vista: 'Frente (anterior)',
    objetivo:
      'Quadríceps femoral, na face anterior da coxa (reto femoral, vasto lateral, vasto medial e vasto intermédio). Ação: extensão do joelho.',
    marcos: 'Coxa anterior e patela.',
    montagem: [
      'O desenho mostra uma montagem bipolar conceitual, não a estimulação seletiva de cada componente.',
      '1A: região muscular proximal anterior. 1B: região muscular distal, acima da patela.',
      'Localize e ajuste os pontos de melhor resposta antes de aumentar a amplitude. Os eletrodos ficam no tecido muscular-alvo; o ponto motor não é uma coordenada fixa.',
    ],
    resposta:
      'Contração útil à extensão, dentro das restrições articulares e pós-operatórias. NMES: contração isolada. FES: só quando integrada de modo seguro ao tempo de uma tarefa, como parte de um treino funcional individualizado.',
    cuidados: ['Não posicione sobre a patela.', 'Não aplique como receita pós-operatória.'],
    legendaDesenho: [
      'Coxa em vista anterior: reto femoral no centro; vasto lateral e vasto medial nas laterais',
      'Faixa diagonal: sartório',
      'Embaixo: patela',
    ],
    descricao:
      'Coxa em vista anterior. Dois eletrodos no trajeto longitudinal do quadríceps, um proximal e outro distal, ambos acima da patela, formando o canal 1.',
    fonte: 'Prancha autoral conceitual; contextualização de estimulação muscular em Nussbaum et al. (R3).',
    recorte: { x: 59, y: 178, w: 50, h: 60 },
    eletrodos: [
      { codigo: '1A', canal: 1, posicao: 'Região proximal anterior', x: 86, y: 190 },
      { codigo: '1B', canal: 1, posicao: 'Região distal, acima da patela', x: 84, y: 222 },
    ],
    ponto: { figura: 'frente', x: 85, y: 208 },
  },
  {
    id: 'tibial-anterior',
    lado: 'esquerdo',
    caracteristicasEletrodos: ELETRODO_DO_APARELHO,
    modalidade: 'FES',
    nome: 'Tibial anterior',
    vista: 'Frente e lado da perna (anterolateral)',
    objetivo:
      'Tibial anterior, na face anterior e lateral à crista da tíbia. Ação: dorsiflexão com componente de inversão.',
    marcos: 'Crista da tíbia e ventre muscular do tibial anterior.',
    montagem: [
      '1A: região proximal do ventre muscular. 1B: região mais distal do ventre, sem deslocar automaticamente para o tendão. Ambos pertencem ao canal 1.',
      'A prancha representa estimulação muscular direta de superfície. Não é um mapa de colocação sobre o nervo fibular comum.',
      'Sistemas de FES para pé caído podem usar outra montagem, perto do trajeto nervoso, com ajuste específico para obter dorsiflexão equilibrada (R5).',
    ],
    resposta:
      'Elevação útil do antepé; verifique inversão excessiva, fadiga e segurança. No uso funcional para marcha, coordene ao balanço.',
    cuidados: [
      'Um aparelho sem gatilho adequado não deve ser apresentado como sistema automático de marcha.',
      'Requer ajuste individual e revisão clínica.',
    ],
    legendaDesenho: [
      'Faixa clara no meio da perna: crista da tíbia',
      'Músculo ao lado da crista, para fora: tibial anterior',
      'Mais para fora: grupo fibular',
    ],
    descricao:
      'Perna em vista anterolateral. A crista da tíbia aparece como uma faixa clara. Dois eletrodos sobre a região muscular lateral à crista, um proximal e outro mais distal.',
    fonte: 'Prancha autoral para discussão de alvo muscular. Pé caído e FES: NICE MIB56 (R5).',
    recorte: { x: 98, y: 252, w: 40, h: 48 },
    eletrodos: [
      { codigo: '1A', canal: 1, posicao: 'Ventre proximal', x: 121, y: 266 },
      { codigo: '1B', canal: 1, posicao: 'Ventre mais distal, sem ir ao tendão', x: 121, y: 288 },
    ],
    ponto: { figura: 'frente', x: 118, y: 276 },
  },
  {
    id: 'extensores-punho',
    lado: 'esquerdo',
    caracteristicasEletrodos: ELETRODO_DO_APARELHO,
    modalidade: 'FES',
    nome: 'Extensores de punho e dedos',
    vista: 'Parte de trás do antebraço (dorsal)',
    objetivo:
      'Grupo extensor no compartimento posterior do antebraço. Tarefa educativa: abrir a mão para soltar um objeto leve, com apoio do antebraço.',
    marcos: 'Antebraço dorsal e punho.',
    montagem: [
      '1A: região proximal do ventre muscular. 1B: região mais distal, ainda sobre tecido muscular.',
      'A seleção final depende dos músculos recrutados e do movimento desejado.',
      'Não prometa que um único par produz abertura seletiva de todos os dedos. Posição do punho, rigidez, espasticidade e recrutamento dos músculos interferem na resposta.',
    ],
    resposta:
      'Extensão útil e confortável. Ajuste se ocorrer desvio excessivo, dor ou movimento que não favoreça a tarefa. Registre assistência, número de repetições úteis e fadiga.',
    cuidados: ['Estimular músculo isoladamente, sem tarefa, continua sendo NMES.'],
    legendaDesenho: [
      'Antebraço em vista posterior: extensores de punho e dedos, no dorso do antebraço',
    ],
    descricao:
      'Antebraço em vista posterior, com dois eletrodos ao longo da região extensora: um proximal e outro distal. O par é identificado como canal 1.',
    fonte:
      'Prancha autoral conceitual; discussão clínica de membros superiores em Nussbaum et al. (R3). Não é mapa individual de pontos motores.',
    recorte: { x: 242, y: 136, w: 40, h: 48 },
    eletrodos: [
      { codigo: '1A', canal: 1, posicao: 'Ventre proximal', x: 266, y: 144 },
      { codigo: '1B', canal: 1, posicao: 'Ventre distal', x: 259, y: 170 },
    ],
    ponto: { figura: 'costas', x: 262, y: 158 },
  },
  {
    id: 'ombro',
    lado: 'direito',
    caracteristicasEletrodos: ELETRODO_DO_APARELHO,
    modalidade: 'TENS',
    nome: 'Ombro',
    vista: 'Costas (posterior), ombro direito',
    objetivo: 'Exemplo sensorial para dor localizada no ombro já avaliada.',
    marcos: 'Espinha da escápula, trapézio superior e deltoide posterior.',
    montagem: [
      '1A e 1B pertencem ao mesmo canal, em pele íntegra ao redor da área dolorosa: 1A sobre o trapézio superior, acima da espinha da escápula, e 1B sobre o deltoide posterior, abaixo.',
      'Ajuste ao mapa da dor e ao conforto; não coloque sobre lesão cutânea ou área com sensibilidade comprometida. Não há distância fixa em centímetros válida para todos.',
    ],
    resposta: 'Formigamento confortável na região-alvo.',
    cuidados: [
      'Mantenha o par sobre o ombro: evite trajetos que atravessem o tórax.',
      'Dor de ombro com sinais de alerta exige investigação antes de qualquer aplicação.',
      'A prancha não estabelece indicação para toda dor de ombro.',
    ],
    legendaDesenho: [
      'Faixa no alto: trapézio superior',
      'Músculo arredondado no ombro: deltoide posterior',
      'Sob os músculos: escápula (omoplata)',
    ],
    descricao:
      'Ombro direito em vista posterior. A espinha da escápula aparece como uma linha diagonal. Um eletrodo acima dela, sobre o trapézio superior, e outro abaixo, sobre o deltoide posterior, formando o canal 1.',
    fonte:
      'Prancha da equipe, fora das pranchas do guia técnico: segue o princípio de cobertura sensorial ao redor da área dolorosa (Johnson, R1).',
    recorte: { x: 253, y: 62, w: 60, h: 72 },
    eletrodos: [
      { codigo: '1A', canal: 1, posicao: 'Sobre o trapézio superior, acima da espinha da escápula', x: 291, y: 74 },
      { codigo: '1B', canal: 1, posicao: 'Sobre o deltoide posterior, abaixo da espinha da escápula', x: 276, y: 93 },
    ],
    ponto: { figura: 'costas', x: 281, y: 92 },
  },
  {
    id: 'abdomen',
    lado: 'bilateral',
    caracteristicasEletrodos: ELETRODO_DO_APARELHO,
    modalidade: 'FES',
    nome: 'Abdômen',
    vista: 'Frente (anterior)',
    objetivo:
      'Reto do abdome e oblíquos, na parede abdominal. Exemplo de estimulação muscular para ativação da parede abdominal.',
    marcos: 'Linha alba (linha central), umbigo, margem das costelas e crista ilíaca.',
    montagem: [
      'Dois pares longitudinais, um sobre cada reto do abdome, ao lado da linha central: canal 1 à esquerda da imagem (1A superior, 1B inferior) e canal 2 à direita (2A superior, 2B inferior).',
      'Mantenha os eletrodos abaixo da margem das costelas, longe da região do coração, e fora do umbigo e de cicatrizes.',
      'Localize e ajuste os pontos de melhor resposta antes de aumentar a amplitude; a intensidade começa em zero em cada canal.',
    ],
    resposta: 'Contração útil e confortável da parede abdominal, sem dor e sem desconforto na pele.',
    cuidados: [
      'Gestação: não aplique. A estimulação abdominal e lombopélvica exige protocolo e supervisão obstétricos específicos.',
      'Dispositivo eletrônico implantado: não aplique sem análise específica do dispositivo e da equipe responsável.',
      'Cirurgia ou reparo recente na região: considere a carga mecânica da contração e as restrições do procedimento.',
      'Pele lesionada, infecção local ou sensibilidade comprometida: não aplique como se a pele fosse íntegra.',
    ],
    legendaDesenho: [
      'Linha central clara: linha alba',
      'Blocos de cada lado: reto do abdome, com as interseções tendíneas',
      'Músculos laterais: oblíquos',
      'Embaixo: crista ilíaca e ligamento inguinal',
    ],
    descricao:
      'Abdômen em vista anterior. A linha central separa dois retos do abdome, cada um em blocos. Dois eletrodos sobre o reto do lado esquerdo da imagem formam o canal 1, e dois sobre o do lado direito formam o canal 2.',
    fonte:
      'Prancha da equipe, fora das pranchas do guia técnico, que não libera montagem abdominal no catálogo geral. Segurança: Houghton et al. (R4).',
    recorte: { x: 68, y: 101, w: 70, h: 84 },
    eletrodos: [
      { codigo: '1A', canal: 1, posicao: 'Reto do abdome esquerdo da imagem, parte superior', x: 94, y: 125 },
      { codigo: '1B', canal: 1, posicao: 'Reto do abdome esquerdo da imagem, parte inferior', x: 94, y: 151 },
      { codigo: '2A', canal: 2, posicao: 'Reto do abdome direito da imagem, parte superior', x: 111, y: 125 },
      { codigo: '2B', canal: 2, posicao: 'Reto do abdome direito da imagem, parte inferior', x: 111, y: 151 },
    ],
    ponto: { figura: 'frente', x: 103, y: 143 },
  },
  {
    id: 'isquiotibiais',
    lado: 'esquerdo',
    caracteristicasEletrodos: ELETRODO_DO_APARELHO,
    modalidade: 'FES',
    nome: 'Coxa posterior (isquiotibiais)',
    vista: 'Costas (posterior), coxa',
    objetivo:
      'Isquiotibiais (bíceps femoral, semitendíneo e semimembranáceo), na parte de trás da coxa. Ação: flexão do joelho e extensão do quadril.',
    marcos: 'Dobra do glúteo e fossa poplítea (a parte de trás do joelho).',
    montagem: [
      '1A: região muscular proximal, logo abaixo da dobra do glúteo. 1B: região muscular distal, acima da fossa poplítea. Ambos pertencem ao canal 1.',
      'Localize e ajuste os pontos de melhor resposta antes de aumentar a amplitude. Os eletrodos ficam no tecido muscular-alvo; o ponto motor não é uma coordenada fixa.',
    ],
    resposta:
      'Contração útil de flexão do joelho, dentro das restrições articulares e pós-operatórias. NMES: contração isolada. FES: só quando integrada de modo seguro ao tempo de uma tarefa.',
    cuidados: [
      'Não posicione sobre a fossa poplítea.',
      'Cirurgia, fratura ou reparo recente: considere a carga mecânica da contração e as restrições do procedimento.',
      'Não aplique como receita pós-operatória.',
    ],
    legendaDesenho: [
      'Parte de trás da coxa: isquiotibiais (bíceps femoral, semitendíneo e semimembranáceo)',
      'Embaixo: fossa poplítea, atrás do joelho',
    ],
    descricao:
      'Coxa em vista posterior. Dois eletrodos no trajeto longitudinal dos isquiotibiais, um proximal e outro distal, acima da fossa poplítea, formando o canal 1.',
    fonte:
      'Prancha da equipe, fora das pranchas do guia técnico: segue o princípio da prancha do quadríceps (Nussbaum et al., R3).',
    recorte: { x: 281, y: 192, w: 40, h: 48 },
    eletrodos: [
      { codigo: '1A', canal: 1, posicao: 'Região muscular proximal, abaixo da dobra do glúteo', x: 309, y: 205 },
      { codigo: '1B', canal: 1, posicao: 'Região muscular distal, acima da fossa poplítea', x: 309, y: 228 },
    ],
    ponto: { figura: 'costas', x: 301, y: 214 },
  }
]

export const NOTAS_DO_ATLAS = {
  comoLer:
    'O desenho orienta a leitura; a posição final depende da avaliação, do ajuste ao corpo e da resposta. Esquema autoral, sem escala.',
  legenda: [
    '1A e 1B formam o canal 1; 2A e 2B formam o canal 2.',
    'A cor ajuda, mas os códigos aparecem sempre.',
    'A e B identificam eletrodos; não significam polo positivo ou negativo.',
    'Em correntes bifásicas balanceadas não há polaridade fixa equivalente à corrente contínua; siga o manual.',
    'Não sobreponha eletrodos nem deixe as bordas se tocarem.',
  ],
}
