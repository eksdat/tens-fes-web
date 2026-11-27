import { useState } from 'react'
import { FeedbackCasoIa } from '../casos/FeedbackCasoIa'
import { CampoTextoLongo } from '../../shared/ui/CampoTextoLongo'
import { Botao } from '../../shared/ui/Botao'
import type { Modalidade } from './api'

const exemplos: Record<Modalidade, string> = {
  TENS: 'No caso fictício da aula, tenho uma paciente com dor no joelho ao subir escadas. Em repouso quase não dói, mas ela evita subir até o segundo andar. Como eu poderia explorar o uso do TENS nesse caso no simulador? Que informações faltam para discutir essa escolha com a professora?',
  FES: 'No caso fictício da aula, tenho um paciente que, após um AVC, tem dificuldade para levantar a ponta do pé quando caminha e às vezes arrasta o pé. Como eu poderia representar o uso da FES para essa tarefa no simulador? O que preciso entender melhor sobre o caso antes de discutir a proposta com a professora?',
}

export function SimularComIa({ modalidade, destinoSimulador }: { modalidade: Modalidade; destinoSimulador: string }) {
  const [relato, setRelato] = useState('')

  return (
    <details className="tf-cartao">
      <summary>Simular com IA</summary>
      <div className="tf-pilha">
        <CampoTextoLongo rotulo={`Caso fictício · ${modalidade}`} value={relato}
          onChange={(evento) => setRelato(evento.target.value)} rows={4} maxLength={2000}
          dica="Descreva o paciente fictício, em que tarefa ele tem dificuldade e sua dúvida sobre TENS ou FES. A IA pode sugerir uma configuração ilustrativa para o simulador." />
        <div><Botao variante="secundario" onClick={() => setRelato(exemplos[modalidade])}>
          Carregar exemplo de {modalidade}
        </Botao></div>
        <FeedbackCasoIa key={`${modalidade}:${relato}`} rota="/simulacoes/ia/feedback"
          rascunho={{ modalidade, relato }} rotulo="Gerar configuração com IA" destinoSimulador={destinoSimulador} />
      </div>
    </details>
  )
}
