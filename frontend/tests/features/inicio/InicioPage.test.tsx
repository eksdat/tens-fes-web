import { screen, within } from '@testing-library/react'
import { Route } from 'react-router'
import { axe } from 'vitest-axe'
import { InicioPage } from '@/features/inicio/InicioPage'
import { renderComRotas } from '../../renderComRotas'

const { estado } = vi.hoisted(() => ({
  estado: { usuario: { nome: 'Ana Souza Lima', perfil: 'ESTUDANTE' as 'ESTUDANTE' | 'PROFISSIONAL' } },
}))

vi.mock('@/features/usuario/useUsuarioAtual', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/usuario/useUsuarioAtual')>()),
  useUsuarioAtual: () => ({ data: estado.usuario }),
}))

function renderizar(perfil: 'ESTUDANTE' | 'PROFISSIONAL' = 'ESTUDANTE') {
  estado.usuario = { nome: 'Ana Souza Lima', perfil }
  return renderComRotas(
    <Route
      path="*"
      element={
        <main>
          <InicioPage />
        </main>
      }
    />,
    '/',
  )
}

function linksDasFerramentas() {
  const ferramentas = within(screen.getByRole('region', { name: 'Ferramentas' }))
  return ferramentas.getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')])
}

test('deveTerUmSoTituloDePrimeiroNivel', () => {
  renderizar()

  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(screen.getByRole('heading', { level: 1, name: 'Aprenda TENS e FES' })).toBeInTheDocument()
})

test('deveCumprimentarPeloPrimeiroNome', () => {
  renderizar()

  expect(screen.getByText('Olá, Ana')).toBeInTheDocument()
  expect(screen.queryByText(/Souza/)).not.toBeInTheDocument()
})

test('deveListarOsDoisModulosComNumeroETitulo', () => {
  renderizar()

  const modulos = within(screen.getByRole('region', { name: 'Módulos' }))
  expect(modulos.getByText('Módulo 01')).toBeInTheDocument()
  expect(modulos.getByRole('heading', { name: 'Alívio da dor' })).toBeInTheDocument()
  expect(modulos.getByText('Módulo 02')).toBeInTheDocument()
  expect(modulos.getByRole('heading', { name: 'Movimento e função' })).toBeInTheDocument()
})

test.each(['ESTUDANTE', 'PROFISSIONAL'] as const)('deveLevarCadaCartaoParaOSeuModulo (%s)', (perfil) => {
  renderizar(perfil)

  expect(screen.getByRole('link', { name: 'Estudar TENS' })).toHaveAttribute('href', '/tens')
  expect(screen.getByRole('link', { name: 'Estudar FES' })).toHaveAttribute('href', '/fes')
})

test('deveOferecerUmaAcaoPrincipalNoDestaque', () => {
  renderizar()

  expect(screen.getByRole('link', { name: 'Começar pelo TENS' })).toHaveAttribute('href', '/tens')
})

test('naoDeveMostrarAVerificacaoEmDuasEtapasNoInicio', () => {
  renderizar()

  expect(screen.queryByRole('link', { name: 'Verificação em duas etapas' })).not.toBeInTheDocument()
})

describe('estudante', () => {
  test('deveMostrarSimuladorAtlasDicionarioEBibliotecaNasFerramentas', () => {
    renderizar('ESTUDANTE')

    expect(linksDasFerramentas()).toEqual([
      ['Abrir o simulador', '/simulador'],
      ['Abrir o atlas de eletrodos', '/tens/eletrodos'],
      ['Abrir o dicionário de parâmetros', '/tens/parametros'],
      ['Abrir a biblioteca', '/biblioteca'],
    ])
  })

  test('naoDeveOferecerAAreaDePacientes', () => {
    renderizar('ESTUDANTE')

    expect(screen.queryByRole('heading', { name: 'Prática clínica' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /pacientes/i })).not.toBeInTheDocument()
  })
})

describe('profissional', () => {
  test('deveMostrarOTituloDaPraticaClinica', () => {
    renderizar('PROFISSIONAL')

    expect(screen.getByRole('heading', { level: 1, name: 'TENS e FES na prática clínica' })).toBeInTheDocument()
  })

  test('deveLevarAosPacientesPelaPraticaClinica', () => {
    renderizar('PROFISSIONAL')

    const pratica = within(screen.getByRole('region', { name: 'Prática clínica' }))
    expect(pratica.getByRole('link', { name: 'Abrir pacientes' })).toHaveAttribute('href', '/pacientes')
  })

  test('deveMostrarSimuladorAtlasEBibliotecaNasFerramentas', () => {
    renderizar('PROFISSIONAL')

    expect(linksDasFerramentas()).toEqual([
      ['Abrir o simulador', '/simulador'],
      ['Abrir o atlas de eletrodos', '/tens/eletrodos'],
      ['Abrir a biblioteca', '/biblioteca'],
    ])
  })
})

test.each(['ESTUDANTE', 'PROFISSIONAL'] as const)('deveSerAcessivelSemViolacoes (%s)', async (perfil) => {
  renderizar(perfil)

  expect(await axe(document.body)).toHaveNoViolations()
})