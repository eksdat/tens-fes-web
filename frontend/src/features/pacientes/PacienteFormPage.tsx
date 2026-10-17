import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import { Alerta } from '../../shared/ui/Alerta'
import { Botao, BotaoLink } from '../../shared/ui/Botao'
import { Campo } from '../../shared/ui/Campo'
import { Dialogo } from '../../shared/ui/Dialogo'
import { TelaCarregando } from '../../shared/ui/TelaCarregando'
import { useToast } from '../../shared/ui/useToast'
import { AvaliacoesDoPaciente } from '../avaliacao/AvaliacoesDoPaciente'
import { SessoesDoPaciente } from '../sessao/SessoesDoPaciente'
import { AvisoDadosFicticios } from './AvisoDadosFicticios'
import {
  atualizarPaciente,
  buscarPaciente,
  CHAVE_PACIENTES,
  criarPaciente,
  excluirPaciente,
  lerErroPaciente,
  type PacienteRequest,
} from './api'
import { hojeLocal } from '../../shared/datas'
import { limparIdentificador, limparNome, pareceDocumento } from './formatar'

const NOME = /^\p{L}[\p{L}\s'’-]*$/u

/** Mesmas regras do PacienteRequest do backend; o backend continua sendo quem decide. */
const schema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.').max(80, 'Use até 80 caracteres.').regex(NOME, 'Use só letras.'),
  sobrenome: z
    .string()
    .trim()
    .min(1, 'Informe o sobrenome.')
    .max(120, 'Use até 120 caracteres.')
    .regex(NOME, 'Use só letras.'),
  identificador: z
    .string()
    .trim()
    .min(1, 'Informe o identificador.')
    .max(40, 'Use até 40 caracteres.')
    .refine((v) => !pareceDocumento(v), 'Parece um documento (CPF). Use um código interno, como CASO-01.'),
  email: z.union([
    z.literal(''),
    z.email('Informe um e-mail válido, como nome@exemplo.com.').max(254, 'Use até 254 caracteres.'),
  ]),
  dataNascimento: z
    .string()
    .min(1, 'Informe a data de nascimento.')
    .refine((v) => v >= '1900-01-01', 'Confira o ano: use uma data a partir de 1900.')
    .refine((v) => v <= hojeLocal(), 'A data de nascimento não pode estar no futuro.'),
})

type Valores = z.infer<typeof schema>

const CAMPOS = ['nome', 'sobrenome', 'identificador', 'email', 'dataNascimento'] as const

export function PacienteFormPage() {
  const { id } = useParams()
  const editando = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { mostrar } = useToast()
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [confirmarExclusao, setConfirmarExclusao] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  const paciente = useQuery({ queryKey: [...CHAVE_PACIENTES, id], queryFn: () => buscarPaciente(id as string), enabled: editando })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', sobrenome: '', identificador: '', email: '', dataNascimento: '' },
  })

  function comFiltro(campo: 'nome' | 'sobrenome' | 'identificador', filtrar: (v: string) => string) {
    const registrado = register(campo)
    return {
      ...registrado,
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        e.target.value = filtrar(e.target.value)
        return registrado.onChange(e)
      },
    }
  }

  useEffect(() => {
    if (paciente.data) reset({ ...paciente.data, email: paciente.data.email ?? '' })
  }, [paciente.data, reset])

  if (editando && paciente.isPending) return <TelaCarregando />
  if (editando && paciente.isError) {
    return (
      <section className="tf-pagina">
        <h1 className="tf-titulo">Paciente</h1>
        <Alerta intencao="perigo" titulo="Paciente não encontrado" />
        <BotaoLink to="/pacientes">Voltar para a lista</BotaoLink>
      </section>
    )
  }

  async function salvar(valores: Valores) {
    setErroGeral(null)
    const corpo: PacienteRequest = { ...valores, email: valores.email || null }
    try {
      if (id) await atualizarPaciente(id, corpo)
      else await criarPaciente(corpo)
      await queryClient.invalidateQueries({ queryKey: CHAVE_PACIENTES })
      mostrar({ tipo: 'sucesso', titulo: id ? 'Paciente atualizado' : 'Paciente cadastrado', texto: 'Os dados foram salvos.' })
      navigate('/pacientes')
    } catch (erro) {
      const lido = lerErroPaciente(erro)
      // Erro de campo que não está na tela (versões diferentes de front e back) vai no alerta, senão some.
      const semCampo: string[] = []
      for (const [campo, mensagem] of Object.entries(lido.campos)) {
        if ((CAMPOS as readonly string[]).includes(campo)) {
          setError(campo as (typeof CAMPOS)[number], { message: mensagem }, { shouldFocus: true })
        } else {
          semCampo.push(mensagem)
        }
      }
      setErroGeral([lido.mensagem, ...semCampo].join(' '))
    }
  }

  async function excluir() {
    if (!id) return
    setExcluindo(true)
    try {
      await excluirPaciente(id)
      // Tirar do cache o paciente excluído e ir para a lista já: rebuscá-lo daria 404 e o React Query
      // repetiria a chamada por segundos antes de liberar o redirecionamento. A lista rebusca sozinha.
      queryClient.removeQueries({ queryKey: [...CHAVE_PACIENTES, id] })
      void queryClient.invalidateQueries({ queryKey: CHAVE_PACIENTES })
      mostrar({ tipo: 'sucesso', titulo: 'Paciente excluído', texto: 'O cadastro saiu da lista e será apagado de vez em 90 dias.' })
      navigate('/pacientes')
    } catch (erro) {
      setExcluindo(false)
      setConfirmarExclusao(false)
      setErroGeral(lerErroPaciente(erro).mensagem)
    }
  }

  return (
    <section className="tf-pagina">
      <div className="tf-pilha">
        <h1 className="tf-titulo">{editando ? 'Editar paciente' : 'Novo paciente'}</h1>
        <p className="tf-sub">Você será o profissional responsável. Só você verá este cadastro.</p>
      </div>

      <AvisoDadosFicticios />

      {erroGeral && (
        <Alerta intencao="perigo" titulo="Não foi possível salvar">
          {erroGeral}
        </Alerta>
      )}

      <form className="tf-cartao tf-pilha" noValidate onSubmit={handleSubmit(salvar)}>
        <div className="tf-form-grade">
          <Campo
            rotulo="Nome"
            placeholder="Maria"
            autoComplete="off"
            maxLength={80}
            erro={errors.nome?.message}
            {...comFiltro('nome', limparNome)}
          />
          <Campo
            rotulo="Sobrenome"
            placeholder="Silva"
            autoComplete="off"
            maxLength={120}
            erro={errors.sobrenome?.message}
            {...comFiltro('sobrenome', limparNome)}
          />
          <Campo
            rotulo="Identificador interno"
            placeholder="CASO-01"
            dica="Letras, números e hífen. Não use documento real."
            autoComplete="off"
            maxLength={40}
            erro={errors.identificador?.message}
            {...comFiltro('identificador', limparIdentificador)}
          />
          <Campo
            rotulo="Data de nascimento"
            type="date"
            min="1900-01-01"
            max={hojeLocal()}
            erro={errors.dataNascimento?.message}
            {...register('dataNascimento')}
          />
          <Campo
            rotulo="E-mail (opcional)"
            type="email"
            inputMode="email"
            placeholder="nome@exemplo.com"
            autoComplete="off"
            maxLength={254}
            erro={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="tf-acoes">
          <Botao type="submit" carregando={isSubmitting}>
            {editando ? 'Salvar alterações' : 'Cadastrar paciente'}
          </Botao>
          <BotaoLink to="/pacientes">Cancelar</BotaoLink>
          {editando && (
            <Dialogo
              titulo="Excluir paciente?"
              descricao="O cadastro some da sua lista agora e é apagado de vez em 90 dias."
              aberto={confirmarExclusao}
              aoFechar={() => {
                if (!excluindo) setConfirmarExclusao(false)
              }}
              gatilho={
                <Botao variante="ghost" onClick={() => setConfirmarExclusao(true)}>
                  Excluir paciente
                </Botao>
              }
              acoes={
                <>
                  <Botao variante="secundario" disabled={excluindo} onClick={() => setConfirmarExclusao(false)}>
                    Cancelar
                  </Botao>
                  <Botao carregando={excluindo} onClick={() => void excluir()}>
                    {excluindo ? 'Excluindo…' : 'Excluir'}
                  </Botao>
                </>
              }
            >
              <p className="tf-sub">Esta ação não pode ser desfeita pela tela.</p>
              <output className="tf-espere">
                {excluindo && (
                  <>
                    <span className="tf-espere__icone" aria-hidden="true" />
                    Excluindo o paciente. Aguarde…
                  </>
                )}
              </output>
            </Dialogo>
          )}
        </div>
      </form>

      {id && <AvaliacoesDoPaciente pacienteId={id} />}
      {id && <SessoesDoPaciente pacienteId={id} />}
    </section>
  )
}
