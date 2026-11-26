import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { Alerta } from '../../shared/ui/Alerta'
import { BotaoLink } from '../../shared/ui/Botao'
import { ROTULO_SECAO } from '../revisao/api'
import { CHAVE_MATERIAIS, listarMateriais, rotuloDoEstado } from './api'

const dataCurta = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')

/** Aba "Criar conteúdo": os materiais de quem está logado, em qualquer estado. Ninguém mais vê o rascunho. */
export function MateriaisPage() {
  const { data, isPending, isError } = useQuery({ queryKey: CHAVE_MATERIAIS, queryFn: listarMateriais })

  return (
    <section className="tf-pagina">
      <div className="tf-pacientes__topo">
        <div className="tf-pilha">
          <h1 className="tf-titulo">Criar conteúdo</h1>
          <p className="tf-sub">
            Monte materiais de estudo e envie para a revisão docente. Até a aprovação, só você vê o que escreveu.
          </p>
        </div>
        <BotaoLink id="onboarding-novo-material" variante="primario" to="/criar-conteudo/novo">
          Novo material
        </BotaoLink>
      </div>

      {isPending && <p className="tf-sub">Carregando seus materiais…</p>}
      {isError && (
        <Alerta intencao="perigo" titulo="Não foi possível carregar seus materiais">
          Tente de novo em instantes.
        </Alerta>
      )}
      {data && data.length === 0 && <p className="tf-sub">Você ainda não criou nenhum material.</p>}

      {data && data.length > 0 && (
        <ul className="tf-materiais" aria-label="Seus materiais">
          {data.map((m) => (
            <li key={m.id} className="tf-cartao tf-pilha">
              <p className="tf-modulo__kicker">
                {m.modalidade} · {ROTULO_SECAO[m.secao]}
              </p>
              <h2 className="tf-cartao__titulo">
                <Link className="tf-link" to={`/criar-conteudo/${m.id}`}>
                  {m.titulo}
                </Link>
              </h2>
              <p className="tf-linha">
                <span className="tf-etiqueta">{rotuloDoEstado(m)}</span>
                <span className="tf-sub">
                  {m.anexos.length === 1 ? '1 anexo' : `${m.anexos.length} anexos`} · alterado em {dataCurta(m.atualizadoEm)}
                </span>
              </p>
              {m.estado === 'RASCUNHO' && m.motivoDevolucao && (
                <Alerta intencao="atencao" titulo="A revisão devolveu este material">
                  {m.motivoDevolucao}
                </Alerta>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
