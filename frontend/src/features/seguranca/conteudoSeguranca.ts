import { R4 } from '../modulo/fontes'
import type { Fonte } from '../modulo/tipos'

/** Guia Técnico, seção 20 (segurança). Referência de segurança: Houghton et al. (R4). */

export type ConteudoSeguranca = {
  introducao: string
  antes: { situacao: string; conduta: string }[]
  checklist: string[]
  durante: string[]
  depois: string[]
  gatilhos: { gatilho: string; mensagem: string }[]
  foraDoEscopo: { itens: string[]; nota: string }
  fontes: Fonte[]
}

export const SEGURANCA: ConteudoSeguranca = {
  introducao:
    'A triagem distingue impedimento, precaução e necessidade de avaliação especializada. As regras combinam modalidade, região, condição e o manual do aparelho.',
  antes: [
    {
      situacao: 'Dispositivo eletrônico implantado',
      conduta: 'Não use exemplo genérico. O risco de interferência exige análise específica do dispositivo, da região e da equipe responsável.',
    },
    {
      situacao: 'Suspeita de trombose ativa',
      conduta: 'Interrompa o caminho de aplicação e oriente avaliação. Evite estimular sobre a região suspeita.',
    },
    {
      situacao: 'Pescoço anterior, olhos ou trajeto pelo tórax',
      conduta: 'Não há montagens nessas regiões no conteúdo geral.',
    },
    {
      situacao: 'Gestação',
      conduta: 'Não há montagem abdominal ou lombopélvica no catálogo geral. Situações obstétricas exigem protocolo e supervisão específicos.',
    },
    {
      situacao: 'Pele lesionada ou infecção local',
      conduta: 'Não aplique eletrodo comum como se a pele fosse íntegra. Tratamentos especializados de feridas estão fora do escopo.',
    },
    {
      situacao: 'Sensibilidade ou comunicação comprometida',
      conduta: 'Aumenta a necessidade de avaliação e de monitorização. Não confie apenas em “está confortável”.',
    },
    {
      situacao: 'Cirurgia, fratura ou reparo recente',
      conduta: 'Considere a carga mecânica da contração e as restrições do procedimento.',
    },
    {
      situacao: 'Tumor na região, epilepsia ou condição complexa',
      conduta: 'Exigem análise clínica contextualizada. Não há autorização automática.',
    },
  ],
  checklist: [
    'Objetivo definido?',
    'Riscos avaliados?',
    'Pele e sensibilidade examinadas?',
    'Cabos e eletrodos íntegros?',
    'Intensidade em zero antes da conexão?',
    'Pessoa orientada a relatar desconforto?',
  ],
  durante: [
    'Monitore o relato, a pele quando necessário, a qualidade do contato e a resposta.',
    'Na estimulação motora, acompanhe movimento, compensações, fadiga e a segurança da tarefa.',
    'Se houver queimação, dor inesperada, mal-estar, alteração cutânea relevante ou movimento inseguro, interrompa a saída e avalie antes de qualquer retomada.',
  ],
  depois: [
    'Zere ou interrompa a saída antes de retirar os eletrodos, conforme o manual.',
    'Observe a pele e registre a resposta, a dose efetivamente realizada e as intercorrências.',
    'Higienização, descarte, armazenamento e reutilização dependem do acessório e das instruções do fabricante.',
  ],
  gatilhos: [
    { gatilho: 'Ardência ou queimação', mensagem: 'Interrompa a estimulação e verifique pele, eletrodo e contato.' },
    {
      gatilho: 'Perda de resposta motora',
      mensagem: 'Revise fadiga, montagem e contexto. Não aumente automaticamente a amplitude.',
    },
    {
      gatilho: 'Risco não esclarecido',
      mensagem: 'A avaliação de segurança está incompleta. Conclua a análise antes de registrar uma aplicação planejada.',
    },
    { gatilho: 'Troca de eletrodos', mensagem: 'Interrompa a saída antes de modificar a montagem.' },
    {
      gatilho: 'Fim da sessão',
      mensagem: 'Registre a condição da pele, a resposta e os ajustes realizados.',
    },
  ],
  foraDoEscopo: {
    itens: [
      'Estimulação intracavitária vaginal ou anal',
      'Aplicações obstétricas',
      'Tratamento de feridas',
      'Músculos desnervados',
    ],
    nota: 'Esses usos precisam de módulos, acessórios e referências próprios. Não extrapole parâmetros de superfície para eles.',
  },
  fontes: [R4],
}
