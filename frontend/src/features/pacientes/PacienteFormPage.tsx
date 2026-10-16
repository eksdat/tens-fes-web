import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import { Alerta } from '../../shared/ui/Alerta'
import { Botao, BotaoLink } from '../../shared/ui/Botao'
import { Campo } from '../../shared/ui/Campo'
import { Dialogo } from '../../shared/ui/Dialogo'
import { TelaCarregando } from '../../shared/ui/TelaCarregando'
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

const hoje = () => new Date().toISOString().slice(0, 10)

/** Mesmas regras do PacienteRequest do backend; o backend continua sendo quem decide. */
const schema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.').max(80, 'Use até 80 caracteres.'),
  sobrenome: z.string().trim().min(1, 'Informe o sobrenome.').max(120, 'Use até 120 caracteres.'),
  identificador: z.string().trim().min(1, 'Informe o identificador.').max(40, 'Use até 40 caracteres.'),
  telefone: z
    .string()
    .trim()
    .regex(/^[0-9()+\- ]{8,20}$/, 'Use só números, espaço, parênteses, + e -, com 8 a 20 caracteres.'),
  email: z.union([z.literal(''), z.email('E-mail inválido.').max(254, 'Use até 254 caracteres.')]),
  dataNascimento: z
    .string()
    .min(1, 'Informe a data de nascimento.')
    .refine((v) => v <= hoje(), 'A data de nascimento não pode estar no futuro.'),
})

type Valores = z.infer<typeof schema>

const CAMPOS = ['nome', 'sobrenome', 'identificador', 'telefone', 'email', 'dataNascimento'] as const

export function PacienteFormPage() {
  const { id } = useParams()
  const editando = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [confirmarExclusao, setConfirmarExclusao] = useState(false)

  const paciente = useQuery({ queryKey: [...CHAVE_PACIENTES, id], queryFn: () => buscarPaciente(id as string), enabled: editando })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', sobrenome: '', identificador: '', telefone: '', email: '', dataNascimento: '' },
  })

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
      navigate('/pacientes')
    } catch (erro) {
      const lido = lerErroPaciente(erro)
      setErroGeral(lido.mensagem)
      for (const [campo, mensagem] of Object.entries(lido.campos)) {
        if ((CAMPOS as readonly string[]).includes(campo)) {
          setError(campo as (typeof CAMPOS)[number], { message: mensagem }, { shouldFocus: true })
        }
      }
    }
  }

  async function excluir() {
    if (!id) return
    try {
      await excluirPaciente(id)
      await queryClient.invalidateQueries({ queryKey: CHAVE_PACIENTES })
      navigate('/pacientes')
    } catch (erro) {
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
          <Campo rotulo="Nome" autoComplete="off" erro={errors.nome?.message} {...register('nome')} />
          <Campo rotulo="Sobrenome" autoComplete="off" erro={errors.sobrenome?.message} {...register('sobrenome')} />
          <Campo
            rotulo="Identificador interno"
            dica="Código que você usa para achar o caso, como CASO-01. Não use documento real."
            autoComplete="off"
            erro={errors.identificador?.message}
            {...register('identificador')}
          />
          <Campo
            rotulo="Data de nascimento"
            type="date"
            max={hoje()}
            erro={errors.dataNascimento?.message}
            {...register('dataNascimento')}
          />
          <Campo rotulo="Telefone" type="tel" autoComplete="off" erro={errors.telefone?.message} {...register('telefone')} />
          <Campo
            rotulo="E-mail (opcional)"
            type="email"
            autoComplete="off"
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
              aoFechar={() => setConfirmarExclusao(false)}
              gatilho={
                <Botao variante="ghost" onClick={() => setConfirmarExclusao(true)}>
                  Excluir paciente
                </Botao>
              }
              acoes={
                <>
                  <Botao variante="secundario" onClick={() => setConfirmarExclusao(false)}>
                    Cancelar
                  </Botao>
                  <Botao onClick={() => void excluir()}>Excluir</Botao>
                </>
              }
            >
              <p className="tf-sub">Esta ação não pode ser desfeita pela tela.</p>
            </Dialogo>
          )}
        </div>
      </form>
    </section>
  )
}
