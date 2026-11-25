import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { RelatorioPaciente } from '../../../src/features/pacientes/RelatorioPaciente'
import type { Paciente } from '../../../src/features/pacientes/api'
import { chaveAvaliacoes } from '../../../src/features/avaliacao/api'
import { chaveSessoes, type Sessao } from '../../../src/features/sessao/api'

it('imprime somente as seções escolhidas e preserva zero e ausência no gráfico e na tabela', async () => {
  const usuario = userEvent.setup()
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
  const paciente: Paciente = {
    id: 'paciente',
    nome: 'Paciente',
    sobrenome: 'Fictício',
    identificador: 'CASO-01',
    email: null,
    dataNascimento: '2000-01-01',
    criadoEm: '',
    criadoPor: 'responsavel',
    alteradoEm: '',
    alteradoPor: 'responsavel',
  }
  const sessao = {
    id: 'sessao',
    dataHora: '2026-10-01T12:00:00Z',
    modalidade: 'TENS',
    dorAntes: 0,
    dorDepois: null,
    dorTarefa: 'Caminhada',
    dorMomento: 'Imediatamente após a tarefa',
  } as Sessao
  client.setQueryData([...chaveAvaliacoes(paciente.id), 'desc'], [])
  client.setQueryData(chaveSessoes(paciente.id), [sessao])
  const imprimir = vi.spyOn(window, 'print').mockImplementation(() => {})
  try {
    render(<QueryClientProvider client={client}>
      <RelatorioPaciente paciente={paciente} profissional={{ id: 'responsavel', nome: 'Nome do profissional' }} />
    </QueryClientProvider>)

    for (const rotulo of ['Identificação', 'Avaliação', 'Sessões']) {
      await usuario.click(screen.getByRole('checkbox', { name: rotulo }))
    }
    const relatorio = document.querySelector<HTMLElement>('.tf-relatorio-impressao')!
    relatorio.style.display = 'block'
    expect(relatorio).not.toHaveTextContent('CASO-01')
    expect(within(relatorio).getByRole('heading', { name: 'Evolução' })).toBeInTheDocument()
    expect(within(relatorio).getByRole('cell', { name: '0' })).toBeInTheDocument()
    expect(within(relatorio).getByRole('cell', { name: 'Não avaliada' })).toBeInTheDocument()
    expect(relatorio.querySelectorAll('meter')).toHaveLength(1)
    expect(relatorio.querySelector('meter')).toHaveAttribute('value', '0')
    await usuario.click(screen.getByRole('button', { name: 'Imprimir relatório' }))
    expect(imprimir).toHaveBeenCalledOnce()
  } finally {
    imprimir.mockRestore()
  }
})
