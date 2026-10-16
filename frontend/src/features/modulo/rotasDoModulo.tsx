import type { RouteObject } from 'react-router'
import { ABAS_MODULO } from './abasModulo'
import { ConteudoPendente } from './ConteudoPendente'
import { ModuloLayout } from './ModuloLayout'
import { PaginaAparelho } from './PaginaAparelho'
import { PaginaCasos } from './PaginaCasos'
import { PaginaEletrodos } from './PaginaEletrodos'
import { PaginaParametros } from './PaginaParametros'
import { PaginaSeguranca } from './PaginaSeguranca'
import { PaginaVisaoGeral } from './PaginaVisaoGeral'
import type { Modulo } from './tipos'

export function rotasDoModulo(modulo: Modulo): RouteObject {
  const titulo = (aba: string) => ({ titulo: `${modulo.sigla} · ${aba}` })
  return {
    path: modulo.base,
    element: <ModuloLayout modulo={modulo} />,
    children: ABAS_MODULO.map(({ rotulo, caminho }) => {
      const pagina =
        rotulo === 'Visão geral' ? (
          <PaginaVisaoGeral modulo={modulo} />
        ) : rotulo === 'Aparelho' && modulo.aparelho ? (
          <PaginaAparelho dados={modulo.aparelho} />
        ) : rotulo === 'Casos' && modulo.casos ? (
          <PaginaCasos dados={modulo.casos} />
        ) : rotulo === 'Segurança' && modulo.seguranca ? (
          <PaginaSeguranca dados={modulo.seguranca} />
        ) : rotulo === 'Eletrodos' && modulo.eletrodos ? (
          <PaginaEletrodos modulo={modulo} />
        ) : rotulo === 'Parâmetros' ? (
          <PaginaParametros dados={modulo.parametros} />
        ) : (
          <ConteudoPendente titulo={rotulo} />
        )
      return caminho
        ? { path: caminho, handle: titulo(rotulo), element: pagina }
        : { index: true, handle: titulo(rotulo), element: pagina }
    }),
  }
}
