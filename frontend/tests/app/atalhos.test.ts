import { atalhosDoPerfil, filtrarAtalhos } from '@/app/atalhos'

const rotulos = (lista: { rotulo: string }[]) => lista.map((a) => a.rotulo)

test('deveOcultarPacientesParaEstudante', () => {
  expect(rotulos(atalhosDoPerfil('ESTUDANTE'))).not.toContain('Pacientes')
})

test('deveListarPacientesParaProfissional', () => {
  expect(rotulos(atalhosDoPerfil('PROFISSIONAL'))).toContain('Pacientes')
})

test('deveListarTudoQuandoAConsultaEstaVazia', () => {
  const todos = atalhosDoPerfil('PROFISSIONAL')

  expect(filtrarAtalhos(todos, '  ')).toEqual(todos)
})

test('deveIgnorarAcentoECaixa', () => {
  const todos = atalhosDoPerfil('ESTUDANTE')

  expect(rotulos(filtrarAtalhos(todos, 'INICIO'))).toEqual(['Início'])
})

test('deveExigirTodasAsPalavrasDaConsulta', () => {
  const todos = atalhosDoPerfil('ESTUDANTE')

  expect(rotulos(filtrarAtalhos(todos, 'criar conteudo'))).toEqual(['Criar conteúdo'])
  expect(filtrarAtalhos(todos, 'criar xyz')).toEqual([])
})

test('deveAcharPorPalavraRelacionada', () => {
  const todos = atalhosDoPerfil('ESTUDANTE')

  expect(rotulos(filtrarAtalhos(todos, 'logout'))).toEqual(['Sair'])
})
