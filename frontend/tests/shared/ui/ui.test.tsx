import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { axe } from 'vitest-axe'
import { Alerta } from './Alerta'
import { AuthLayout } from './AuthLayout'
import { Botao } from './Botao'
import { Campo } from './Campo'
import { CampoSenha } from './CampoSenha'

test('deveLigarRotuloDicaEErroAoCampo', () => {
  render(<Campo rotulo="E-mail" dica="Use o e-mail da faculdade" erro="Informe seu e-mail" />)

  const campo = screen.getByLabelText('E-mail')
  expect(campo).toHaveAttribute('aria-invalid', 'true')
  expect(campo).toHaveAccessibleDescription(/Use o e-mail da faculdade.*Erro: Informe seu e-mail/)
  expect(screen.getByRole('alert')).toHaveTextContent('Erro: Informe seu e-mail')
})

test('deveFicarSemErroQuandoOCampoEstaValido', () => {
  render(<Campo rotulo="E-mail" />)

  expect(screen.getByLabelText('E-mail')).not.toHaveAttribute('aria-invalid')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('deveMostrarEOcultarASenha', async () => {
  render(<CampoSenha rotulo="Senha" />)
  const campo = screen.getByLabelText('Senha')
  const botao = screen.getByRole('button', { name: 'Mostrar senha' })

  expect(campo).toHaveAttribute('type', 'password')
  expect(botao).toHaveAttribute('aria-pressed', 'false')

  await userEvent.click(botao)

  expect(campo).toHaveAttribute('type', 'text')
  expect(botao).toHaveAttribute('aria-pressed', 'true')
})

test('deveAnunciarSoOAlertaDePerigoComoAlert', () => {
  render(
    <>
      <Alerta intencao="perigo" titulo="Erro grave" />
      <Alerta intencao="sucesso" titulo="Tudo certo" />
    </>,
  )

  expect(screen.getByRole('alert')).toHaveTextContent('Erro grave')
  expect(screen.getByRole('status')).toHaveTextContent('Tudo certo')
})

test('deveDesabilitarOBotaoEmProgresso', () => {
  render(<Botao carregando>Entrar</Botao>)

  const botao = screen.getByRole('button', { name: 'Entrar' })
  expect(botao).toBeDisabled()
  expect(botao).toHaveAttribute('aria-busy', 'true')
})

test('deveRenderizarOLayoutSemViolacoesDeAcessibilidade', async () => {
  const { container } = render(
    <MemoryRouter>
      <AuthLayout kicker="Kicker" titulo="Título do painel" texto="Texto do painel" voltarPara="/login">
        <h1>Entrar</h1>
        <Campo rotulo="E-mail" erro="Informe seu e-mail" />
        <CampoSenha rotulo="Senha" />
        <Alerta intencao="atencao" titulo="Atenção">
          Texto
        </Alerta>
        <Botao>Entrar</Botao>
      </AuthLayout>
    </MemoryRouter>,
  )

  expect(await axe(container)).toHaveNoViolations()
})
