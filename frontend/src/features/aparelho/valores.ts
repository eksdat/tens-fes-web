import type { EstadoDoAparelho } from './estado'

const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

export type DescricaoDoControle = { unidade: string; valor: string; estado: string }

const SEM_UNIDADE = 'Sem unidade'
const NAO_SIMULADO = 'Não simulado'
const SEM_ESTADO = 'Sem estado próprio'

/** Unidade, valor atual e estado de cada controle do manual (guia, seção 10: "nome, função, unidade, valor, estado"). */
export function descreverControle(numeroDoControle: number, e: EstadoDoAparelho): DescricaoDoControle {
  const emitindo = e.emExecucao && (e.intensidade1 > 0 || e.intensidade2 > 0)
  const simulacao = e.emExecucao ? 'Simulação em execução' : 'Simulação pausada'

  switch (numeroDoControle) {
    case 1:
      return { unidade: SEM_UNIDADE, valor: 'Ligado', estado: 'Aparelho ligado' }
    case 3:
      return { unidade: SEM_UNIDADE, valor: `${e.modalidade}, modo ${e.modo}`, estado: simulacao }
    case 4:
      return { unidade: 'Hz e µs', valor: `${numero.format(e.frequenciaHz)} Hz · ${numero.format(e.larguraUs)} µs`, estado: SEM_ESTADO }
    case 6:
      return { unidade: SEM_UNIDADE, valor: e.emExecucao ? 'Em execução' : 'Parado', estado: simulacao }
    case 7:
      return {
        unidade: 'mA',
        valor: `Canal 1: ${numero.format(e.intensidade1)} mA · Canal 2: ${numero.format(e.intensidade2)} mA`,
        estado: SEM_ESTADO,
      }
    case 8: {
      const valor = emitindo ? 'Corrente sendo emitida' : 'Sem corrente'
      return { unidade: SEM_UNIDADE, valor, estado: valor }
    }
    case 2:
    case 5:
      return { unidade: SEM_UNIDADE, valor: NAO_SIMULADO, estado: SEM_ESTADO }
    default:
      return { unidade: SEM_UNIDADE, valor: 'Peça física, sem valor', estado: 'Sem estado simulado' }
  }
}

type CampoAnunciado = 'frequencia' | 'largura' | 'intensidade1' | 'intensidade2' | 'subida' | 'plato' | 'descida' | 'repouso'

const FRASES: Record<CampoAnunciado, string> = {
  frequencia: 'Frequência alterada para',
  largura: 'Largura de pulso alterada para',
  intensidade1: 'Intensidade do canal 1 alterada para',
  intensidade2: 'Intensidade do canal 2 alterada para',
  subida: 'Rampa de subida alterada para',
  plato: 'Platô alterado para',
  descida: 'Rampa de descida alterada para',
  repouso: 'Repouso alterado para',
}

/** "1 segundos" não existe: com o valor 1 o extenso vai para o singular. */
const extensoPara = (valor: number, extenso: string) => (valor === 1 && extenso.endsWith('s') ? extenso.slice(0, -1) : extenso)

/** Frases do guia (seção 10, "Mensagens prontas"), no padrão "Frequência alterada para 80 hertz." */
export function mensagemDeAjuste(campo: CampoAnunciado, valor: number, extenso: string): string {
  if ((campo === 'intensidade1' || campo === 'intensidade2') && valor === 0) {
    return `Canal ${campo === 'intensidade1' ? 1 : 2}: intensidade zero.`
  }
  return `${FRASES[campo]} ${numero.format(valor)} ${extensoPara(valor, extenso)}.`
}
