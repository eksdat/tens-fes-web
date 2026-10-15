import { screen, within } from '@testing-library/react'
import { Route } from 'react-router'
import { axe } from 'vitest-axe'
import { InicioPage } from '@/features/inicio/InicioPage'
import { renderComRotas } from '../../renderComRotas'

vi.mock('@/features/usuario/useUsuarioAtual', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/usuario/useUsuarioAtual')>()),
  useUsuarioAtual: () => ({ data: { nome: 'Ana Souza Lima', perfil: 'ESTUDANTE' } }),
}))

function renderizar() {
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

test('deveLevarCadaCartaoParaOSeuModulo', () => {
  renderizar()

  expect(screen.getByRole('link', { name: 'Estudar TENS' })).toHaveAttribute('href', '/tens')
  expect(screen.getByRole('link', { name: 'Estudar FES' })).toHaveAttribute('href', '/fes')
})

test('deveOferecerUmaAcaoPrincipalNoDestaque', () => {
  renderizar()

  expect(screen.getByRole('link', { name: 'Começar pelo TENS' })).toHaveAttribute('href', '/tens')
})

test('deveManterOAtalhoDaVerificacaoEmDuasEtapas', () => {
  renderizar()

  expect(screen.getByRole('link', { name: 'Verificação em duas etapas' })).toHaveAttribute('href', '/mfa/ativar')
})

test('deveSerAcessivelSemViolacoes', async () => {
  renderizar()

  expect(await axe(document.body)).toHaveNoViolations()
})
