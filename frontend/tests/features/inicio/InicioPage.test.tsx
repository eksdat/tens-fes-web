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

function linksDosAtalhos() {
  const atalhos = within(screen.getByRole('region', { name: 'Atalhos' }))
  return atalhos.getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')])
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

test('deveManterOAtalhoDaVerificacaoEmDuasEtapas', () => {
  renderizar()

  expect(screen.getByRole('link', { name: 'Verificação em duas etapas' })).toHaveAttribute('href', '/mfa/ativar')
})

describe('estudante', () => {
  test('deveComecarPeloTensNoDestaque', () => {
    renderizar('ESTUDANTE')

    expect(screen.getByRole('link', { name: 'Começar pelo TENS' })).toHaveAttribute('href', '/tens')
  })

  test('deveMostrarSimuladorAtlasEDicionarioNosAtalhos', () => {
    renderizar('ESTUDANTE')

    expect(linksDosAtalhos()).toEqual([
      ['Abrir o simulador', '/simulador'],
      ['Abrir o atlas de eletrodos', '/tens/eletrodos'],
      ['Abrir o dicionário de parâmetros', '/tens/parametros'],
    ])
  })

  test('naoDeveOferecerAAreaDePacientes', () => {
    renderizar('ESTUDANTE')

    expect(screen.queryByRole('link', { name: /pacientes/i })).not.toBeInTheDocument()
  })
})

describe('profissional', () => {
  test('deveLevarAosPacientesNoDestaque', () => {
    renderizar('PROFISSIONAL')

    expect(screen.getByRole('link', { name: 'Ver meus pacientes' })).toHaveAttribute('href', '/pacientes')
    expect(screen.queryByRole('link', { name: 'Começar pelo TENS' })).not.toBeInTheDocument()
  })

  test('deveMostrarPacientesEAtlasNosAtalhos', () => {
    renderizar('PROFISSIONAL')

    expect(linksDosAtalhos()).toEqual([
      ['Abrir a lista de pacientes', '/pacientes'],
      ['Abrir o atlas de eletrodos', '/tens/eletrodos'],
    ])
  })
})

test.each(['ESTUDANTE', 'PROFISSIONAL'] as const)('deveSerAcessivelSemViolacoes (%s)', async (perfil) => {
  renderizar(perfil)

  expect(await axe(document.body)).toHaveNoViolations()
})
