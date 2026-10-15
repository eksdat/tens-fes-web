/** Texto da aba Eletrodos que vale para TENS e FES (manual do Neurodyn, cap. 8.3 e 8.6, e Guia Técnico, seção 20). */

export const COMO_COLOCAR = [
  'Posicione a pessoa com conforto, sentada ou deitada.',
  'Examine a pele do local e limpe a área. A pele sob os eletrodos precisa estar íntegra.',
  'Prepare a pessoa e coloque os eletrodos antes de programar o aparelho.',
  'Use o gel fornecido com o aparelho e pressione o eletrodo inteiro contra a pele, para que toda a superfície encoste.',
  'Confira cabos e eletrodos, com a intensidade em zero antes da conexão.',
  'Aumente a intensidade só depois de os eletrodos estarem bem fixados.',
  'Verifique o contato durante a aplicação e examine a pele de novo ao final.',
]

export const IDENTIFICACAO = {
  codigo:
    'O código tem duas partes: o número é o canal (1 ou 2) e a letra separa os dois eletrodos do mesmo canal, como o proximal e o distal. A letra não é polo positivo nem negativo.',
  tamanho:
    'Os dois eletrodos do par têm o mesmo tamanho (técnica bipolar). Colocar um eletrodo menor sobre o ponto motor e um maior sobre a dor é outra técnica, a monopolar, fora deste módulo.',
  ordem:
    'Não há ordem entre A e B. O que importa é não misturar canais: ligue cada cabo ao seu canal, com o anel de identificação da mesma cor, para o controle de intensidade do canal 1 ajustar de fato o canal 1.',
}

export const RECOMENDACOES = [
  'Use os eletrodos que acompanham o aparelho. Se precisar de outro tipo, prefira tamanho maior: eletrodo menor pode irritar e queimar a pele.',
  'Interrompa a saída antes de trocar a montagem e não leve a intensidade de uma montagem para a outra.',
  'Evite montagens com trajeto pelo tórax, região anterior do pescoço e olhos. Eletrodos perto do tórax podem aumentar o risco de fibrilação cardíaca.',
  'Troque eletrodos de borracha que ressecarem ou racharem, ou a cada seis meses. Eletrodo gasto dá a sensação de aparelho fraco.',
  'Lave os eletrodos com água corrente, seque com papel toalha e use só o gel recomendado: outros produtos podem danificá-los.',
  'Ao terminar, registre a condição da pele, a resposta e os ajustes realizados.',
]

export const DO_FABRICANTE_ELETRODOS = [
  'Eletrodos de borracha condutiva de 5 cm × 5 cm: use com intensidade máxima de saída de 50 mA pico a pico. Acima disso há risco de efeitos adversos; se precisar de mais, use eletrodos maiores, comprados à parte.',
  'Eletrodos menores que os fornecidos: a densidade de corrente não deve passar de 2 mA por cm².',
  'Eletrodos autoadesivos precisam de registro na ANVISA e seguem as instruções do fabricante deles.',
]
