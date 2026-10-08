import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router'
import { axe } from 'vitest-axe'
import { renderComRotas } from '../../renderComRotas'
import { PerfilPage } from '@/features/perfil/PerfilPage'
import * as apiPerfil from '@/features/usuario/atualizarPerfil'

const { estado } = vi.hoisted(() => ({
  estado: {
    usuario: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      nome: 'Ana Souza',
      perfil: 'ESTUDANTE' as 'ESTUDANTE' | 'PROFISSIONAL',
      revisor: false,
      instituicao: 'UniBH',
      periodo: 5,
      categoria: undefined as 'FISIOTERAPEUTA' | 'TERAPEUTA_OCUPACIONAL' | 'OUTRA' | undefined,
      registro: undefined as string | undefined,
      uf: undefined as 'MG' | undefined,
    },
  },
}))

vi.mock('@/features/usuario/useUsuarioAtual', () => ({
  CHAVE_USUARIO_ATUAL: ['usuario', 'me'],
  useUsuarioAtual: () => ({ data: estado.usuario, isPending: false }),
}))

function renderizar() {
  return renderComRotas(<Route path="/perfil" element={<PerfilPage />} />, '/perfil')
}

beforeEach(() => {
  vi.clearAllMocks()
  estado.usuario = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nome: 'Ana Souza',
    perfil: 'ESTUDANTE',
    revisor: false,
    instituicao: 'UniBH',
    periodo: 5,
    categoria: undefined,
    registro: undefined,
    uf: undefined,
  }
})

test('deveMostrarMensagemObrigatoriaEFormularioParaEstudante', () => {
  renderizar()

  expect(
    screen.getByText('Após a formação, atualize seu perfil e informe seu registro profissional.'),
  ).toBeInTheDocument()

  expect(screen.getByRole('heading', { level: 1, name: 'Meu perfil' })).toBeInTheDocument()
  expect(screen.getByText('Ana Souza')).toBeInTheDocument()
  expect(screen.getByText('Estudante')).toBeInTheDocument()
  expect(screen.getByText(/UniBH \(5º período\)/)).toBeInTheDocument()

  expect(screen.getByLabelText('Categoria profissional')).toBeInTheDocument()
  expect(screen.getByLabelText('Número do registro')).toBeInTheDocument()
  expect(screen.getByLabelText('UF do registro')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Salvar registro profissional' })).toBeInTheDocument()

  // Critério 5: Não mostra selo de profissional verificado
  expect(screen.queryByText(/verificado/i)).not.toBeInTheDocument()
})

test('deveValidarCamposObrigatoriosNaTransicaoParaProfissional', async () => {
  renderizar()

  await userEvent.click(screen.getByRole('button', { name: 'Salvar registro profissional' }))

  expect(screen.getByText('Informe o número do registro')).toBeInTheDocument()
  expect(screen.getByText('Escolha a UF do registro')).toBeInTheDocument()
})

test('deveValidarFormatoDoRegistroConformeCategoria', async () => {
  renderizar()

  await userEvent.type(screen.getByLabelText('Número do registro'), '123')
  await userEvent.selectOptions(screen.getByLabelText('UF do registro'), 'MG')
  await userEvent.click(screen.getByRole('button', { name: 'Salvar registro profissional' }))

  expect(screen.getByRole('alert')).toHaveTextContent('Use o formato 123456-F')
})

test('devePromoverParaProfissionalAoSalvarFormularioComSucesso', async () => {
  const atualizarSpy = vi.spyOn(apiPerfil, 'atualizarPerfilProfissional').mockResolvedValue({
    ...estado.usuario,
    perfil: 'PROFISSIONAL',
    categoria: 'FISIOTERAPEUTA',
    registro: '123456-F',
    uf: 'MG',
  })

  renderizar()

  await userEvent.type(screen.getByLabelText('Número do registro'), '123456-f')
  await userEvent.selectOptions(screen.getByLabelText('UF do registro'), 'MG')
  await userEvent.click(screen.getByRole('button', { name: 'Salvar registro profissional' }))

  expect(atualizarSpy).toHaveBeenCalledWith({
    categoria: 'FISIOTERAPEUTA',
    registro: '123456-F',
    uf: 'MG',
  })

  expect(
    await screen.findByText('Seu perfil agora é Profissional. Você já tem acesso à área de pacientes.'),
  ).toBeInTheDocument()
})

test('deveMostrarDadosDoProfissionalSemFormularioNemSeloDeVerificado', () => {
  estado.usuario = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nome: 'Bia Lima',
    perfil: 'PROFISSIONAL',
    revisor: false,
    instituicao: 'UFMG',
    periodo: 10,
    categoria: 'FISIOTERAPEUTA',
    registro: '654321-F',
    uf: 'MG',
  }

  renderizar()

  expect(screen.getByText('Bia Lima')).toBeInTheDocument()
  expect(screen.getByText('Profissional')).toBeInTheDocument()
  expect(screen.getByText('Fisioterapeuta')).toBeInTheDocument()
  expect(screen.getByText('654321-F / MG')).toBeInTheDocument()
  expect(screen.getByText(/UFMG \(10º período\)/)).toBeInTheDocument()

  // Não exibe formulário de transição nem texto de estudante formado
  expect(
    screen.queryByText('Após a formação, atualize seu perfil e informe seu registro profissional.'),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Salvar registro profissional' })).not.toBeInTheDocument()

  // Critério 5: Não exibe selo de profissional verificado
  expect(screen.queryByText(/verificado/i)).not.toBeInTheDocument()
})

test('deveRenderizarSemViolacoesDeAcessibilidade', async () => {
  const { container } = renderizar()
  expect(await axe(container)).toHaveNoViolations()
})
