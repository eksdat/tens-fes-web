import { useSearchParams } from 'react-router'
import { CampoSelecao } from '../../shared/ui/CampoSelecao'
import { REFERENCIAS } from './referencias'

const FILTROS = [
  { chave: 'modalidade', rotulo: 'Modalidade', opcoes: ['TENS', 'NMES/FES'] },
  { chave: 'tema', rotulo: 'Tema', opcoes: [...new Set(REFERENCIAS.map((r) => r.tema))] },
  { chave: 'tipo', rotulo: 'Tipo de material', opcoes: [...new Set(REFERENCIAS.map((r) => r.tipo))] },
  { chave: 'idioma', rotulo: 'Idioma', opcoes: [...new Set(REFERENCIAS.map((r) => r.idioma))] },
  { chave: 'acesso', rotulo: 'Acesso', opcoes: [...new Set(REFERENCIAS.map((r) => r.acesso))] },
] as const

export function BibliotecaPage() {
  const [params, setParams] = useSearchParams()
  const filtros = FILTROS.map((filtro) => ({
    ...filtro,
    valor: filtro.opcoes.find((opcao) => opcao === params.get(filtro.chave)) ?? '',
  }))
  const resultados = REFERENCIAS.filter((r) => filtros.every(({ chave, valor }) =>
    !valor || (chave === 'modalidade' ? r.modalidades.includes(valor) : r[chave] === valor),
  ))

  return (
    <div className="tf-pagina tf-pilha">
      <h1 className="tf-titulo">Biblioteca digital</h1>
      <fieldset className="tf-simulador__campos">
        <legend>Filtrar referências</legend>
        {filtros.map(({ chave, rotulo, opcoes, valor }) => (
          <CampoSelecao
            key={chave}
            rotulo={rotulo}
            value={valor}
            opcoes={[{ valor: '', rotulo: 'Todos' }, ...opcoes.map((opcao) => ({ valor: opcao, rotulo: opcao }))]}
            onChange={(evento) => {
              const novos = new URLSearchParams(params)
              if (evento.target.value) novos.set(chave, evento.target.value)
              else novos.delete(chave)
              setParams(novos, { replace: true })
            }}
          />
        ))}
      </fieldset>
      <output>{resultados.length ? `${resultados.length} ${resultados.length === 1 ? 'referência' : 'referências'}` : 'Nenhuma referência para os filtros selecionados.'}</output>
      <ul className="tf-lista-cartoes">
        {resultados.map((r) => (
          <li key={r.codigo} className="tf-cartao">
            <article className="tf-pilha">
              <h2 className="tf-titulo tf-titulo--cartao">{r.titulo}</h2>
              <p>{r.codigo} · {r.referencia}</p>
              <p className="tf-sub">{r.tema} · {r.tipo} · {r.idioma} · {r.modalidades.join(' e ')}</p>
              <p>{r.descricao}</p>
              <p className="tf-sub">{r.acesso}. {r.direitos}</p>
              <p className="tf-sub">Conferência bibliográfica em <time dateTime={r.conferidaEm}>{r.conferidaEm.split('-').reverse().join('/')}</time>.</p>
              <a className="tf-link" href={r.url} aria-label={`Abrir fonte de ${r.titulo}`}>Abrir fonte</a>
            </article>
          </li>
        ))}
      </ul>
    </div>
  )
}
