import { R4 } from '../modulo/fontes'
import type { Fonte } from '../modulo/tipos'

/** Guia Técnico, seção 20 (segurança). Referência de segurança: Houghton et al. (R4). */

/** Antes: perguntas do 'Checklist pronto' (seção 20). Durante e Depois: as orientações da seção 20, no imperativo. */
/** O código é o que a sessão grava (nunca muda); o texto pode ser reescrito sem alterar registros antigos. */
export type ItemChecklist = { codigo: string; texto: string }

export type EtapaChecklist = { etapa: 'Antes' | 'Durante' | 'Depois'; grupos: { titulo: string; itens: ItemChecklist[] }[] }

export type ConteudoSeguranca = {
  introducao: string
  antes: { situacao: string; conduta: string }[]
  checklist: EtapaChecklist[]
  /** Urgente: o leitor de tela anuncia de imediato (role="alert"). */
  gatilhos: { gatilho: string; mensagem: string; urgente: boolean }[]
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
    {
      etapa: 'Antes',
      grupos: [
        {
          titulo: 'Avaliação',
          itens: [{ codigo: 'antes.objetivo-definido', texto: 'Objetivo definido?' }, { codigo: 'antes.riscos-avaliados', texto: 'Riscos avaliados?' }, { codigo: 'antes.paciente-orientado', texto: 'Paciente orientado a relatar desconforto?' }],
        },
        {
          titulo: 'Contraindicações e precauções',
          itens: [{ codigo: 'antes.impedimentos-descartados', texto: 'Impedimentos da triagem descartados?' }, { codigo: 'antes.precaucoes-registradas', texto: 'Precauções identificadas e registradas?' }],
        },
        { titulo: 'Pele', itens: [{ codigo: 'antes.pele-examinada', texto: 'Pele e sensibilidade examinadas?' }] },
        { titulo: 'Equipamento', itens: [{ codigo: 'antes.cabos-eletrodos-integros', texto: 'Cabos e eletrodos íntegros?' }, { codigo: 'antes.intensidade-zero', texto: 'Intensidade em zero antes da conexão?' }] },
      ],
    },
    {
      etapa: 'Durante',
      grupos: [
        {
          titulo: 'Resposta',
          itens: [
            { codigo: 'durante.monitorar-relato-contato-resposta', texto: 'Monitore o relato, o contato dos eletrodos e a resposta.' },
            { codigo: 'durante.acompanhar-movimento-fadiga', texto: 'Na estimulação motora, acompanhe movimento, compensações, fadiga e segurança da tarefa.' },
          ],
        },
        { titulo: 'Desconforto', itens: [{ codigo: 'durante.observar-pele', texto: 'Observe a pele quando necessário.' }] },
        {
          titulo: 'Critérios de interrupção',
          itens: [
            { codigo: 'durante.interromper-se-queimacao', texto: 'Se houver queimação, dor inesperada, mal-estar, alteração cutânea relevante ou movimento inseguro, interrompa a saída e avalie antes de retomar.' },
          ],
        },
      ],
    },
    {
      etapa: 'Depois',
      grupos: [
        { titulo: 'Pele', itens: [{ codigo: 'depois.observar-pele', texto: 'Observe a pele depois da retirada.' }] },
        { titulo: 'Intercorrências', itens: [{ codigo: 'depois.registrar-resposta-dose', texto: 'Registre a resposta, a dose efetivamente realizada e as intercorrências.' }] },
        {
          titulo: 'Cuidados com o material',
          itens: [
            { codigo: 'depois.zerar-saida-antes-de-retirar', texto: 'Zere ou interrompa a saída antes de retirar os eletrodos, conforme o manual.' },
            { codigo: 'depois.cuidar-do-material', texto: 'Higienize, descarte ou guarde o material conforme as instruções do fabricante.' },
          ],
        },
      ],
    },
  ],
  gatilhos: [
    {
      gatilho: 'Ardência ou queimação',
      mensagem: 'Interrompa a estimulação e verifique pele, eletrodo e contato.',
      urgente: true,
    },
    {
      gatilho: 'Perda de resposta motora',
      mensagem: 'Revise fadiga, montagem e contexto. Não aumente automaticamente a amplitude.',
      urgente: false,
    },
    {
      gatilho: 'Risco não esclarecido',
      mensagem: 'A avaliação de segurança está incompleta. Conclua a análise antes de registrar uma aplicação planejada.',
      urgente: true,
    },
    { gatilho: 'Troca de eletrodos', mensagem: 'Interrompa a saída antes de modificar a montagem.', urgente: false },
    {
      gatilho: 'Fim da sessão',
      mensagem: 'Registre a condição da pele, a resposta e os ajustes realizados.',
      urgente: false,
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
