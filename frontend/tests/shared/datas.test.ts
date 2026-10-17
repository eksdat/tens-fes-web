import { agoraLocal, hojeLocal } from '@/shared/datas'

describe('data de hoje no fuso de quem usa', () => {
  test('deveUsarODiaLocalMesmoQuandoEmUtcJaEAmanha', () => {
    expect(hojeLocal(new Date(2026, 9, 17, 23, 30))).toBe('2026-10-17')
  })

  test('deveDarDataEHoraLocaisParaCampoDatetimeLocal', () => {
    expect(agoraLocal(new Date(2026, 9, 17, 23, 30))).toBe('2026-10-17T23:30')
  })
})
