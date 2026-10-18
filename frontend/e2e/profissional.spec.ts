import { expect, test } from './apoio/fixtures'
import { GANCHO } from './apoio/dados'

// Capitão Gancho: fisioterapeuta, quer registrar a sessão em menos de dois minutos. Pacientes fictícios (irmãos Darling).

const JOAO = { nome: 'João', sobrenome: 'Darling', identificador: 'CASO-01', dataNascimento: '1990-05-12' }
const MIGUEL = { nome: 'Miguel', sobrenome: 'Darling', identificador: 'CASO-02', dataNascimento: '1995-08-30' }

test('deveExigirOCodigoDoAutenticadorAoEntrar', async ({ page, supabase }) => {
  supabase.adicionar(GANCHO)
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(GANCHO.email)
  await page.getByLabel('Senha', { exact: true }).fill(GANCHO.senha)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Digite o código' })).toBeVisible()
  await page.getByLabel('Dígito 1 de 6').fill('000000')
  await page.getByRole('button', { name: 'Verificar' }).click()
  await expect(page.getByText('Código incorreto ou vencido. Confira o aplicativo e tente de novo.')).toBeVisible()

  await page.getByLabel('Dígito 1 de 6').fill('123456')
  await page.getByRole('button', { name: 'Verificar' }).click()

  await expect(page.getByText('Olá, Capitão')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Pacientes' })).toBeVisible()
})

test('deveCadastrarPacienteAvaliarERegistrarSessao', async ({ page, entrarComo, api }) => {
  await entrarComo(GANCHO)

  // Paciente
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Pacientes' }).click()
  await expect(page.getByText('Nenhum paciente cadastrado ainda.')).toBeVisible()
  await page.getByRole('link', { name: 'Novo paciente' }).click()
  await page.getByLabel('Nome', { exact: true }).fill(JOAO.nome)
  await page.getByLabel('Sobrenome').fill(JOAO.sobrenome)
  await page.getByLabel('Identificador interno').fill(JOAO.identificador)
  await page.getByLabel('Data de nascimento').fill(JOAO.dataNascimento)
  await page.getByRole('button', { name: 'Cadastrar paciente' }).click()

  await expect(page.getByText('Paciente cadastrado', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'João Darling' }).click()

  // Avaliação inicial
  await page.getByRole('link', { name: 'Nova avaliação' }).click()
  await page.getByLabel('Data da avaliação').fill('2026-10-01')
  await page.getByLabel('Descreva a queixa').fill('Dor no joelho direito ao subir escada.')
  for (const item of [
    'Dispositivo eletrônico implantado',
    'Gestação',
    'Suspeita de trombose',
    'Infecção',
    'Alteração de pele ou sensibilidade',
    'Restrições',
  ]) {
    await page.getByRole('group', { name: item }).getByRole('radio', { name: 'Ausente' }).check()
  }
  await page.getByLabel('Dor de 0 a 10').fill('6')
  await page.getByLabel('Tarefa').fill('Subir 10 degraus')
  await page.getByLabel('Momento').fill('Antes da sessão')
  await page.getByLabel('Objetivo mensurável').fill('Subir 10 degraus com dor até 3/10.')
  await page.getByRole('button', { name: 'Salvar avaliação' }).click()

  await expect(page.getByText('Avaliação salva', { exact: true })).toBeVisible()
  const avaliacoes = page.getByRole('region', { name: 'Avaliações' })
  await expect(avaliacoes.getByRole('row', { name: /01\/10\/2026 6 Subir 10 degraus/ })).toBeVisible()

  // Sessão
  await page.getByRole('link', { name: 'Registrar sessão' }).click()
  await expect(page.getByText('Este paciente ainda não tem avaliação inicial.')).toHaveCount(0)
  await page.getByLabel('Data e hora').fill('2026-10-02T14:30')
  await page.getByLabel('Objetivo desta sessão').fill('Analgesia antes do treino de escada.')
  await page.getByLabel('Modo', { exact: true }).fill('Convencional')
  await page.getByLabel('Duração real, em minutos').fill('20')
  await page.getByLabel('Frequência do canal 1, em hertz').fill('80')
  await page.getByLabel('Largura de pulso do canal 1, em microssegundos').fill('100')
  await page.getByLabel('Amplitude final do canal 1, em miliampères').fill('18')
  await page.getByLabel('Par de eletrodos do canal 1').fill('1A-1B')
  await page.getByLabel('Prancha do atlas (opcional)').selectOption({ label: 'Joelho' })
  await page.getByLabel('Condição da pele').fill('Íntegra, sem vermelhidão.')
  await page.getByLabel('Motivo do término').fill('Tempo planejado concluído.')
  await page.getByLabel('Plano de reavaliação').fill('Reavaliar a dor na escada na próxima sessão.')
  for (const item of ['Objetivo definido?', 'Pele e sensibilidade examinadas?', 'Intensidade em zero antes da conexão?']) {
    await page.getByRole('checkbox', { name: item }).check()
  }
  await page.getByRole('button', { name: 'Revisar sessão' }).click()

  await expect(page.getByRole('heading', { name: 'Revise antes de salvar' })).toBeVisible()
  await expect(page.getByText('Canal 1: 80 Hz · 100 µs · 18 mA (final) · par 1A-1B')).toBeVisible()
  await expect(page.getByText('3 itens marcados')).toBeVisible()
  await page.getByRole('button', { name: 'Salvar sessão' }).click()

  await expect(page.getByText('Sessão registrada', { exact: true })).toBeVisible()
  const sessoes = page.getByRole('region', { name: 'Sessões' })
  await expect(sessoes.getByRole('row', { name: /TENS 20 min Analgesia antes do treino de escada/ })).toBeVisible()

  // O que chegou na API: parâmetros efetivos, prancha do atlas e os códigos do checklist.
  expect(api.sessoes).toHaveLength(1)
  expect(api.sessoes[0]).toMatchObject({
    modalidade: 'TENS',
    duracaoRealMin: 20,
    montagemId: 'joelho',
    canais: [{ canal: 1, frequenciaHz: 80, larguraPulsoUs: 100, amplitudeInicialMa: null, amplitudeFinalMa: 18, par: '1A-1B' }],
    checklist: ['antes.objetivo-definido', 'antes.pele-examinada', 'antes.intensidade-zero'],
  })
})

test('deveAvisarQuandoOIdentificadorJaExiste', async ({ page, entrarComo, api }) => {
  api.adicionarPaciente(GANCHO, JOAO)
  await entrarComo(GANCHO)
  await page.goto('/pacientes/novo')

  await page.getByLabel('Nome', { exact: true }).fill(MIGUEL.nome)
  await page.getByLabel('Sobrenome').fill(MIGUEL.sobrenome)
  await page.getByLabel('Identificador interno').fill(JOAO.identificador)
  await page.getByLabel('Data de nascimento').fill(MIGUEL.dataNascimento)
  await page.getByRole('button', { name: 'Cadastrar paciente' }).click()

  await expect(page.getByLabel('Identificador interno')).toHaveAccessibleDescription(/Você já tem um paciente com este identificador/)
  await expect(page).toHaveURL('/pacientes/novo')
  expect(api.pacientes).toHaveLength(1)
})

test('deveBuscarPacientePorNomeOuIdentificador', async ({ page, entrarComo, api }) => {
  api.adicionarPaciente(GANCHO, JOAO)
  api.adicionarPaciente(GANCHO, MIGUEL)
  await entrarComo(GANCHO)
  await page.goto('/pacientes')
  await expect(page.getByText('2 pacientes')).toBeVisible()

  await page.getByLabel('Buscar por nome ou identificador').fill('caso-02')
  await page.getByRole('button', { name: 'Buscar' }).click()

  await expect(page.getByRole('link', { name: 'Miguel Darling' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'João Darling' })).toHaveCount(0)
  await expect(page).toHaveURL('/pacientes?busca=caso-02')
})
