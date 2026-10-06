import type { Session } from '@supabase/supabase-js'
import { nivelDaSessao } from './useNivelMfa'

function token(claims: object) {
  const parte = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `cabecalho.${parte}.assinatura`
}

function sessao(aal: string, fatores: { id: string; factor_type: string; status: string }[] = []) {
  return { access_token: token({ aal, nome: 'Ação' }), user: { factors: fatores } } as unknown as Session
}

test('deveLerSessaoSemAutenticador', () => {
  expect(nivelDaSessao(sessao('aal1'))).toEqual({ atual: 'aal1', proximo: 'aal1', fatorId: undefined })
})

test('deveExigirCodigoQuandoHaAutenticadorVerificadoESessaoAal1', () => {
  const nivel = nivelDaSessao(sessao('aal1', [{ id: 'f1', factor_type: 'totp', status: 'verified' }]))

  expect(nivel).toEqual({ atual: 'aal1', proximo: 'aal2', fatorId: 'f1' })
})

test('deveIgnorarAutenticadorNuncaConfirmado', () => {
  const nivel = nivelDaSessao(sessao('aal1', [{ id: 'f1', factor_type: 'totp', status: 'unverified' }]))

  expect(nivel.proximo).toBe('aal1')
})

test('deveReconhecerSessaoJaVerificada', () => {
  expect(nivelDaSessao(sessao('aal2', [{ id: 'f1', factor_type: 'totp', status: 'verified' }])).atual).toBe('aal2')
})
