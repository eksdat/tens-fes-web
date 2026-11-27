import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { api } from '../../shared/api/client'
import { Alerta } from '../../shared/ui/Alerta'
import { Botao, BotaoLink } from '../../shared/ui/Botao'
import { camposConfiguracaoIa, type ConfiguracaoIa } from '../simulador/configuracaoIa'
import { BURST } from '../simulador/tracado'

const criterios = {
  objetivo: 'Objetivo e justificativa',
  cenario: 'Avaliação do cenário',
  parametros: 'Parâmetros e unidades',
  montagem: 'Descrição da montagem',
}
const estados = {
  coerente: 'Coerente',
  revisar: 'Revisar',
  informacao_insuficiente: 'Informação insuficiente',
}
type Feedback = {
  observacoes: Record<keyof typeof criterios, { estado: keyof typeof estados; comentario: string }>
  pergunta: string
  referencias: string[]
  simulacao?: ConfiguracaoIa | null
}

const formatarValor = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

export function FeedbackCasoIa({ rota, rascunho, rotulo = 'Pedir avaliação da IA', destinoSimulador = '/simulador' }: {
  rota: string
  rascunho?: { modalidade: string; relato: string }
  rotulo?: string
  destinoSimulador?: string
}) {
  const salvo = useQuery({
    queryKey: [rota, 'feedback'],
    queryFn: async () => (await api.get<Feedback | ''>(rota)).data,
    enabled: !rascunho,
    retry: false,
    gcTime: 0,
  })
  const pedido = useMutation({
    mutationFn: async () => (await api.post<Feedback>(rota, rascunho)).data,
    gcTime: 0,
  })
  const feedback = pedido.data || salvo.data
  const status = axios.isAxiosError(pedido.error) ? pedido.error.response?.status : undefined
  return (
    <section className="tf-pilha" aria-label="Feedback educativo" aria-live="polite">
      {feedback ? (
        <>
          <h3>Feedback educativo gerado por IA</h3>
          <dl className="tf-caso-detalhes tf-pilha">
            {(Object.keys(criterios) as (keyof typeof criterios)[]).map((chave) => {
              const item = feedback.observacoes[chave]
              return <div key={chave}><dt>{criterios[chave]} · {estados[item.estado]}</dt><dd>{item.comentario}</dd></div>
            })}
          </dl>
          <p><strong>Para refletir</strong> {feedback.pergunta}</p>
          {feedback.simulacao ? <ConfiguracaoSugerida configuracao={feedback.simulacao} destinoSimulador={destinoSimulador} /> : (
            <p className="tf-sub">Nenhuma configuração compatível para aplicar. Revise o critério Parâmetros e unidades.</p>
          )}
          {feedback.referencias.length > 0 && <details>
            <summary>Referências da base revisada</summary>
            <ul>{feedback.referencias.map((referencia) => <li key={referencia}>{referencia}</li>)}</ul>
          </details>}
        </>
      ) : (
        <>
          <p className="tf-sub">O feedback e os valores sugeridos são gerados por inteligência artificial para simulação educacional. Ao pedir a avaliação, você envia o relato ao provedor de IA. Use apenas dados inventados.</p>
          <div><Botao variante="secundario" onClick={() => pedido.mutate()}
            disabled={pedido.isPending || salvo.isFetching || Boolean(rascunho && !rascunho.relato.trim())}
            carregando={pedido.isPending}>
            {pedido.isPending ? 'Avaliando…' : rotulo}
          </Botao></div>
        </>
      )}
      {pedido.isError && <Alerta intencao="atencao" titulo={status === 422
        ? 'Use um caso inteiramente fictício.' : status === 429
          ? 'Você atingiu o limite de avaliações desta hora.' : 'A avaliação está indisponível. Tente novamente em instantes.'} />}
    </section>
  )
}

function ConfiguracaoSugerida({ configuracao, destinoSimulador }: { configuracao: ConfiguracaoIa; destinoSimulador: string }) {
  const { modalidade, modo, valores } = configuracao
  const consulta = new URLSearchParams({ modalidade, modo })
  return (
    <div className="tf-pilha tf-cartao">
      <h4>Configuração para testar no simulador</h4>
      <p><strong>{modalidade} · {modo}</strong></p>
      <p className="tf-sub">Gerado por IA · Apenas para simulação educacional</p>
      <dl className="tf-form-grade tf-caso-detalhes">
        {modo === 'Burst' && <div>
          <dt>Frequência fixa</dt><dd>{BURST.frequenciaInternaHz} Hz · {BURST.rajadasPorSegundo} rajadas/s</dd>
        </div>}
        {camposConfiguracaoIa.map(({ id, rotulo, unidade }) => {
          const valor = valores[id]
          return valor === undefined ? null : (
            <div key={id}><dt>{rotulo}</dt><dd>{formatarValor.format(valor)} {unidade}</dd></div>
          )
        })}
        <div><dt>Intensidade inicial · Canal 1</dt><dd>0 mA</dd></div>
        <div><dt>Intensidade inicial · Canal 2</dt><dd>0 mA</dd></div>
      </dl>
      <Alerta titulo="Canais 1 e 2 começam em 0 mA">
        A configuração da IA inclui os parâmetros do pulso. As intensidades são ajustadas no simulador.
        Para visualizar a onda, use a amplitude de exemplo ou ajuste um canal manualmente.
      </Alerta>
      <div><BotaoLink to={`${destinoSimulador}?${consulta}`} state={{ configuracaoIa: configuracao }}>
        Aplicar no simulador
      </BotaoLink></div>
    </div>
  )
}
