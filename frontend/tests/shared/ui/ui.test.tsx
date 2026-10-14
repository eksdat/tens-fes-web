import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { axe } from 'vitest-axe'
import { Alerta } from '@/shared/ui/Alerta'
import { AuthLayout } from '@/shared/ui/AuthLayout'
import { Botao } from '@/shared/ui/Botao'
import { Campo } from '@/shared/ui/Campo'
import { CampoSenha } from '@/shared/ui/CampoSenha'
import { Dialogo } from '@/shared/ui/Dialogo'

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

describe('Dialogo', () => {
  test('deveAbrirEFecharPorCliqueNoBotao', async () => {
    render(
      <Dialogo
        gatilho={<Botao>Abrir</Botao>}
        titulo="Confirmar ação"
        descricao="Essa ação não pode ser desfeita."
      >
        <p>Conteúdo do diálogo.</p>
      </Dialogo>,
    )

    // Antes de abrir: diálogo não está na árvore
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))

    // Depois de abrir
    const dialogo = screen.getByRole('dialog')
    expect(dialogo).toBeInTheDocument()
    expect(screen.getByText('Confirmar ação')).toBeInTheDocument()
    expect(screen.getByText('Essa ação não pode ser desfeita.')).toBeInTheDocument()

    // Fechar pelo botão X
    await userEvent.click(screen.getByRole('button', { name: 'Fechar diálogo' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  test('deveTerTituloLigadoAoPainelViaAriaLabelledby', async () => {
    render(
      <Dialogo gatilho={<Botao>Abrir</Botao>} titulo="Título acessível">
        <p>Corpo</p>
      </Dialogo>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))

    const dialogo = screen.getByRole('dialog')
    expect(dialogo).toHaveAccessibleName('Título acessível')
  })

  test('deveFecharPelasTeclaEsc', async () => {
    render(
      <Dialogo gatilho={<Botao>Abrir</Botao>} titulo="Esc fecha">
        <p>Conteúdo</p>
      </Dialogo>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  test('deveRenderizarSemViolacoesDeAcessibilidade', async () => {
    const { container } = render(
      <Dialogo
        gatilho={<Botao>Abrir</Botao>}
        titulo="Confirmar exclusão"
        descricao="Você está prestes a excluir este item."
        acoes={
          <>
            <Botao variante="secundario">Cancelar</Botao>
            <Botao variante="primario">Confirmar</Botao>
          </>
        }
      >
        <p>Esta ação é irreversível.</p>
      </Dialogo>,
    )

    // Verificar acessibilidade antes de abrir (gatilho)
    expect(await axe(container)).toHaveNoViolations()

    // Verificar acessibilidade com o diálogo aberto
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
