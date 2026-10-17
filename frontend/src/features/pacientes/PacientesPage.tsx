import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Alerta } from '../../shared/ui/Alerta'
import { Botao, BotaoLink } from '../../shared/ui/Botao'
import { Campo } from '../../shared/ui/Campo'
import { AvisoDadosFicticios } from './AvisoDadosFicticios'
import { CHAVE_PACIENTES, listarPacientes, type ColunaOrdenavel, type FiltroPacientes } from './api'
import { formatarData } from './formatar'

const COLUNAS: { coluna: ColunaOrdenavel; rotulo: string }[] = [
  { coluna: 'nome', rotulo: 'Nome' },
  { coluna: 'identificador', rotulo: 'Identificador' },
  { coluna: 'dataNascimento', rotulo: 'Nascimento' },
  { coluna: 'alteradoEm', rotulo: 'Última alteração' },
]

const ROTULO_DIRECAO = { asc: 'crescente', desc: 'decrescente' } as const

function lerFiltro(params: URLSearchParams): FiltroPacientes {
  const ordenar = COLUNAS.find((c) => c.coluna === params.get('ordenar'))?.coluna ?? 'nome'
  const pagina = Math.max(0, Number(params.get('pagina')) || 0)
  return { busca: params.get('busca') ?? '', ordenar, direcao: params.get('direcao') === 'desc' ? 'desc' : 'asc', pagina }
}

export function PacientesPage() {
  const [params, setParams] = useSearchParams()
  const filtro = lerFiltro(params)
  const [texto, setTexto] = useState(filtro.busca)
  const { data, isPending, isError } = useQuery({
    queryKey: [...CHAVE_PACIENTES, filtro],
    queryFn: () => listarPacientes(filtro),
    placeholderData: keepPreviousData,
  })

  // Página que deixou de existir (exclusão, link antigo): vai para a última, em vez de dizer que a lista está vazia.
  const paginaSumiu = !!data && data.itens.length === 0 && filtro.pagina > 0 && data.totalItens > 0
  useEffect(() => {
    if (!paginaSumiu || !data) return
    const p = new URLSearchParams(params)
    const ultima = Math.max(0, data.totalPaginas - 1)
    if (ultima > 0) p.set('pagina', String(ultima))
    else p.delete('pagina')
    setParams(p, { replace: true })
  }, [paginaSumiu, data, params, setParams])

  function atualizar(mudancas: Partial<FiltroPacientes>) {
    const novo = { ...filtro, pagina: 0, ...mudancas }
    const p = new URLSearchParams()
    if (novo.busca) p.set('busca', novo.busca)
    if (novo.ordenar !== 'nome') p.set('ordenar', novo.ordenar)
    if (novo.direcao !== 'asc') p.set('direcao', novo.direcao)
    if (novo.pagina > 0) p.set('pagina', String(novo.pagina))
    setParams(p)
  }

  function ordenarPor(coluna: ColunaOrdenavel) {
    const inverter = filtro.ordenar === coluna && filtro.direcao === 'asc'
    atualizar({ ordenar: coluna, direcao: inverter ? 'desc' : 'asc' })
  }

  function aoBuscar(evento: FormEvent) {
    evento.preventDefault()
    atualizar({ busca: texto.trim() })
  }

  return (
    <section className="tf-pagina">
      <div className="tf-pacientes__topo">
        <div className="tf-pilha">
          <h1 className="tf-titulo">Pacientes</h1>
          <p className="tf-sub">Só você vê os pacientes que cadastrou.</p>
        </div>
        <BotaoLink variante="primario" to="/pacientes/novo">
          Novo paciente
        </BotaoLink>
      </div>

      <AvisoDadosFicticios />

      <search>
        <form className="tf-pacientes__busca" onSubmit={aoBuscar}>
        <Campo
          rotulo="Buscar por nome ou identificador"
          type="search"
          maxLength={100}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <Botao type="submit" variante="secundario">
          Buscar
        </Botao>
        </form>
      </search>

      {isError && (
        <Alerta intencao="perigo" titulo="Não foi possível carregar os pacientes">
          Tente de novo em instantes.
        </Alerta>
      )}

      {isPending && <p className="tf-sub">Carregando pacientes…</p>}

      {data && data.itens.length === 0 && !paginaSumiu && (
        <output className="tf-sub tf-pacientes__vazio">
          {filtro.busca ? `Nenhum paciente encontrado para "${filtro.busca}".` : 'Nenhum paciente cadastrado ainda.'}
        </output>
      )}

      {data && data.itens.length > 0 && (
        <>
          <div className="tf-tabela__rolagem">
            <table className="tf-tabela">
              <caption className="tf-sr-only">
                Pacientes, ordenados por {COLUNAS.find((c) => c.coluna === filtro.ordenar)?.rotulo.toLowerCase()},{' '}
                {ROTULO_DIRECAO[filtro.direcao]}
              </caption>
              <thead>
                <tr>
                  {COLUNAS.map(({ coluna, rotulo }) => {
                    const ativa = filtro.ordenar === coluna
                    return (
                      <th
                        key={coluna}
                        scope="col"
                        aria-sort={ativa ? (filtro.direcao === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        <button type="button" className="tf-tabela__ordenar" onClick={() => ordenarPor(coluna)}>
                          {rotulo}
                          <span aria-hidden="true" className="tf-tabela__seta">
                            {ativa ? (filtro.direcao === 'asc' ? '▲' : '▼') : '↕'}
                          </span>
                        </button>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {data.itens.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link className="tf-link" to={`/pacientes/${p.id}`}>
                        {p.nome} {p.sobrenome}
                      </Link>
                    </td>
                    <td className="tf-tabela__mono">{p.identificador}</td>
                    <td>{formatarData(p.dataNascimento)}</td>
                    <td>{new Date(p.alteradoEm).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="tf-paginacao" aria-label="Páginas de pacientes">
            <Botao variante="secundario" disabled={filtro.pagina === 0} onClick={() => atualizar({ pagina: filtro.pagina - 1, busca: filtro.busca })}>
              Anterior
            </Botao>
            <p className="tf-sub">
              Página {data.pagina + 1} de {Math.max(1, data.totalPaginas)} · {data.totalItens}{' '}
              {data.totalItens === 1 ? 'paciente' : 'pacientes'}
            </p>
            <Botao
              variante="secundario"
              disabled={data.pagina + 1 >= data.totalPaginas}
              onClick={() => atualizar({ pagina: filtro.pagina + 1, busca: filtro.busca })}
            >
              Próxima
            </Botao>
          </nav>
        </>
      )}
    </section>
  )
}
