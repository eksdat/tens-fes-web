import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { CasosClinicosPage } from '../../../src/features/casos/CasosClinicosPage'
import { api } from '../../../src/shared/api/client'

vi.mock('../../../src/shared/api/client', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

it('envia o caso como multipart e abre a resposta educativa do próprio envio', async () => {
  const caso = {
    titulo: 'Cenário fictício', objetivo: 'Estudar analgesia', contexto: 'Simulação em aula',
    avaliacao: 'Sensibilidade preservada', modalidade: 'TENS', parametros: 'Frequência em Hz',
    montagem: 'Montagem simulada', justificativa: 'Comparar modalidades', duvida: 'Quais critérios comparar?',
  }
  vi.mocked(api.get).mockImplementation(async (url) => ({
    data: url.endsWith('/caso-1')
      ? { caso, anexos: [], origem: { liberada: false, blocos: [], referencias: [], dataRevisao: null } }
      : [{ id: 'caso-1', titulo: caso.titulo, criadoEm: '2026-11-25T12:00:00Z' }],
  }))
  vi.mocked(api.post).mockResolvedValue({ data: 'caso-1' })
  const usuario = userEvent.setup()
  render(
    <QueryClientProvider client={new QueryClient()}>
      <CasosClinicosPage />
    </QueryClientProvider>,
  )

  expect(screen.getByText('Use caso fictício. Não inclua identificação de pacientes.')).toBeVisible()
  const rotulos = {
    titulo: 'Título', objetivo: 'Objetivo', contexto: 'Contexto', avaliacao: 'Avaliação do cenário',
    parametros: 'Parâmetros com unidades', montagem: 'Montagem dos eletrodos', justificativa: 'Justificativa',
    duvida: 'Dúvida',
  } as const
  for (const chave of Object.keys(rotulos) as (keyof typeof rotulos)[]) {
    fireEvent.change(screen.getByLabelText(rotulos[chave]), { target: { value: caso[chave] } })
  }
  await usuario.selectOptions(screen.getByLabelText('Modalidade'), caso.modalidade)
  const anexo = new File(['%PDF-'], 'cenario.pdf', { type: 'application/pdf' })
  await usuario.upload(screen.getByLabelText('Anexos opcionais'), anexo)
  await usuario.click(screen.getByRole('button', { name: 'Enviar caso' }))

  expect(await screen.findByRole('heading', { name: 'Resposta educativa' })).toBeVisible()
  expect(screen.getByText(/Não encontrei, na base revisada/)).toBeVisible()
  const [rota, dados] = vi.mocked(api.post).mock.calls[0]
  const corpo = dados as FormData
  const parteCaso = corpo.get('caso') as Blob
  expect(rota).toBe('/casos-clinicos')
  const json = await new Promise<string>((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onload = () => resolve(String(leitor.result))
    leitor.onerror = () => reject(leitor.error)
    leitor.readAsText(parteCaso)
  })
  expect(JSON.parse(json)).toEqual(caso)
  expect(corpo.getAll('anexos')).toEqual([anexo])
  expect(api.get).toHaveBeenCalledWith('/casos-clinicos/caso-1')
})
