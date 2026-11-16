import { useQueryClient } from '@tanstack/react-query'
import { useRef, useState, type ChangeEvent } from 'react'
import { Alerta } from '../../shared/ui/Alerta'
import { Botao } from '../../shared/ui/Botao'
import { Campo } from '../../shared/ui/Campo'
import { useToast } from '../../shared/ui/useToast'
import { abrirAnexo } from './abrirAnexo'
import {
  anexarArquivo,
  CHAVE_MATERIAIS,
  conferirArquivo,
  formatarTamanho,
  lerErroMaterial,
  linkDoAnexo,
  MAXIMO_ANEXOS,
  removerAnexo,
  TIPOS_ACEITOS,
  type Material,
} from './api'

type Props = {
  material: Material
  /** Só rascunho aceita anexar e remover; depois de enviado, só abrir. */
  editavel: boolean
}

export function AnexosDoMaterial({ material, editavel }: Props) {
  const queryClient = useQueryClient()
  const { mostrar } = useToast()
  const entrada = useRef<HTMLInputElement>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState<string | null>(null)
  const [removendo, setRemovendo] = useState<string | null>(null)
  const cheio = material.anexos.length >= MAXIMO_ANEXOS

  async function atualizar() {
    await queryClient.invalidateQueries({ queryKey: CHAVE_MATERIAIS })
  }

  async function aoEscolher(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setErro(null)
    const problema = conferirArquivo(arquivo)
    if (problema) {
      setErro(problema)
      e.target.value = ''
      return
    }
    setEnviando(arquivo.name)
    try {
      await anexarArquivo(material.id, arquivo)
      await atualizar()
      mostrar({ tipo: 'sucesso', titulo: 'Arquivo anexado', texto: arquivo.name })
    } catch (falha) {
      const lido = lerErroMaterial(falha)
      setErro(lido.campos.arquivo ?? lido.mensagem)
    } finally {
      setEnviando(null)
      if (entrada.current) entrada.current.value = ''
    }
  }

  async function remover(anexoId: string, nome: string) {
    setErro(null)
    setRemovendo(anexoId)
    try {
      await removerAnexo(material.id, anexoId)
      await atualizar()
      mostrar({ tipo: 'sucesso', titulo: 'Anexo removido', texto: nome })
    } catch (falha) {
      setErro(lerErroMaterial(falha).mensagem)
    } finally {
      setRemovendo(null)
    }
  }

  async function abrir(anexoId: string) {
    setErro(null)
    if (!(await abrirAnexo(() => linkDoAnexo(material.id, anexoId)))) {
      setErro('Não foi possível abrir o anexo agora. Tente de novo em instantes.')
    }
  }

  return (
    <section className="tf-cartao tf-pilha" aria-labelledby="titulo-anexos">
      <h2 id="titulo-anexos" className="tf-cartao__titulo">
        Anexos
      </h2>

      {editavel && (
        <Campo
          ref={entrada}
          rotulo="Anexar arquivo"
          type="file"
          accept={TIPOS_ACEITOS}
          dica={
            cheio
              ? `Limite de ${MAXIMO_ANEXOS} anexos atingido. Remova um para anexar outro.`
              : `PDF, PNG ou JPEG, até 10 MB. Até ${MAXIMO_ANEXOS} por material.`
          }
          disabled={cheio || enviando !== null}
          onChange={(e) => void aoEscolher(e)}
        />
      )}

      <output className="tf-espere">
        {enviando && (
          <>
            <span className="tf-espere__icone" aria-hidden="true" />
            Enviando {enviando}. Aguarde…
          </>
        )}
      </output>

      {erro && <Alerta intencao="perigo" titulo={erro} />}

      {material.anexos.length === 0 ? (
        <p className="tf-sub">Nenhum arquivo anexado.</p>
      ) : (
        <ul className="tf-anexos">
          {material.anexos.map((a) => (
            <li key={a.id} className="tf-anexos__item">
              <span>
                <strong>{a.nome}</strong>{' '}
                <span className="tf-sub">
                  {a.tipo} · {formatarTamanho(a.tamanhoBytes)}
                </span>
              </span>
              <span className="tf-acoes">
                <Botao variante="secundario" aria-label={`Abrir ${a.nome}`} onClick={() => void abrir(a.id)}>
                  Abrir
                </Botao>
                {editavel && (
                  <Botao
                    variante="ghost"
                    aria-label={`Remover ${a.nome}`}
                    carregando={removendo === a.id}
                    onClick={() => void remover(a.id, a.nome)}
                  >
                    Remover
                  </Botao>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
