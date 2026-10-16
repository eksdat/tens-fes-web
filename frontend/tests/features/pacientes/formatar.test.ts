import { limparIdentificador, limparNome, pareceDocumento } from '@/features/pacientes/formatar'

describe('identificador', () => {
  test('deveDeixarSoLetrasDigitosEHifenEmMaiuscula', () => {
    expect(limparIdentificador('caso 01/ã#')).toBe('CASO01')
    expect(limparIdentificador('caso-01_a.b')).toBe('CASO-01_A.B')
  })

  test('deveReconhecerNumeroComCaraDeDocumento', () => {
    expect(pareceDocumento('12345678901')).toBe(true)
    expect(pareceDocumento('123.456.789-01')).toBe(true)
    expect(pareceDocumento('CASO-01')).toBe(false)
  })
})

describe('nome', () => {
  test('deveTirarDigitosESimbolosEManterAcentoApostrofoEHifen', () => {
    expect(limparNome('Jo4ão D’Ávila-Silva!')).toBe('João D’Ávila-Silva')
  })
})
