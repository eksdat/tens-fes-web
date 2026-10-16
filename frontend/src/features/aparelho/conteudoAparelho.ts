import type { ItemFaq } from '../../shared/ui/PerguntasFrequentes'
import { M1 } from '../modulo/fontes'
import type { Fonte } from '../modulo/tipos'

/**
 * Aparelho de referência: Neurodyn Portable TENS/FES (Ibramed). Nomenclatura do manual, 12ª edição (cap. 9 e 10) e
 * Guia Técnico, seções 09 e 10. Sem foto nem desenho do painel: a posição física das peças só entra com o manual na mão.
 */

export type Controle = { numero: number; nome: string; funcao: string }

export type ConteudoAparelho = {
  introducao: string
  controles: Controle[]
  conexoes: string[]
  operacao: string[]
  perguntas: ItemFaq[]
  fontes: Fonte[]
}

export const APARELHO: ConteudoAparelho = {
  introducao:
    'O aparelho de referência é o Neurodyn Portable TENS/FES, da Ibramed, com 2 canais independentes em amplitude. A lista abaixo segue os nomes do manual do fabricante. Confira sempre o manual do seu modelo: o que vale para outro aparelho pode mudar.',
  controles: [
    { numero: 1, nome: 'Tecla LIGA/DESLIGA', funcao: 'Alimenta o equipamento. Ligar o aparelho não inicia a estimulação.' },
    { numero: 2, nome: 'LED de carga da bateria', funcao: 'Indica que a bateria está carregando.' },
    { numero: 3, nome: 'Display de parâmetros', funcao: 'Mostra a terapia, os parâmetros, o tempo e o estado do tratamento.' },
    {
      numero: 4,
      nome: 'Teclas SET + e SET −',
      funcao: 'Escolhem a terapia e o protocolo (pré-programado ou particular) e aumentam ou diminuem o parâmetro selecionado.',
    },
    { numero: 5, nome: 'Teclas BACK e NEXT', funcao: 'Avançam e retrocedem entre os parâmetros, conforme o que o display apresenta.' },
    { numero: 6, nome: 'Tecla START/STOP', funcao: 'Inicia ou interrompe o tratamento.' },
    {
      numero: 7,
      nome: 'Teclas UP e DOWN',
      funcao: 'Aumentam e diminuem a intensidade da corrente. Há um par para o canal 1 e outro para o canal 2.',
    },
    { numero: 8, nome: 'Indicador luminoso da saída da corrente', funcao: 'Sinaliza que há corrente sendo emitida.' },
    { numero: 9, nome: 'Clip para cinto', funcao: 'Prende o aparelho ao cinto.' },
    { numero: 10, nome: 'Etiqueta de características técnicas', funcao: 'Traz as informações técnicas do equipamento.' },
    { numero: 11, nome: 'Compartimento da bateria', funcao: 'Aloja a bateria do aparelho.' },
    { numero: 12, nome: 'Conector do cabo do canal 1', funcao: 'Recebe o cabo de eletroestimulação do canal 1.' },
    { numero: 13, nome: 'Conector do cabo do canal 2', funcao: 'Recebe o cabo de eletroestimulação do canal 2.' },
    { numero: 14, nome: 'Conector da fonte de alimentação', funcao: 'Recebe o plugue da fonte.' },
  ],
  conexoes: [
    'Canal: circuito de saída identificado. Um canal usa dois eletrodos, e os dois canais deste aparelho são independentes em amplitude.',
    'Cabo de eletroestimulação: conduz os pulsos. Cada cabo termina em um pino vermelho e um pino preto, um para cada eletrodo do par.',
    'Anéis de identificação: encaixe-os nos cabos na primeira vez que usar o aparelho e ligue cada cabo ao canal da mesma cor. Isso evita ajustar a intensidade do canal errado.',
    'Para retirar o eletrodo do pino, puxe pela capa protetora do conector. Nunca puxe pelo cabo.',
    'Fonte e bateria: o aparelho funciona ligado à fonte ou com a bateria. A tensão da rede não é dose terapêutica.',
    'Não improvise adaptadores. Use pinos, cabos e eletrodos compatíveis com o manual.',
  ],
  operacao: [
    'Prepare a pessoa e coloque os eletrodos antes de ligar e programar o aparelho.',
    'A intensidade de cada canal começa em zero e só sobe depois de os eletrodos estarem fixados.',
    'No fim do tempo programado soa um sinal e a emissão de corrente para. Pressione STOP para silenciar o sinal.',
    'Para interromper antes do fim, pressione STOP e depois LIGA/DESLIGA.',
    'Em emergência, desligue imediatamente na tecla LIGA/DESLIGA.',
    'Desligue o aparelho da fonte, se estiver ligado, e limpe e guarde o aparelho e os acessórios conforme o manual.',
  ],
  perguntas: [
    {
      pergunta: 'Ligar o aparelho começa a estimulação?',
      destaque: 'Não. Ligar só alimenta o equipamento.',
      detalhe: 'A saída de corrente começa com START e para com STOP. Mantenha a intensidade de cada canal em zero ao ligar.',
    },
    {
      pergunta: 'O que é um canal?',
      destaque: 'É um circuito de saída, que usa dois eletrodos.',
      detalhe: 'O Neurodyn Portable tem 2 canais com controle de intensidade independente. O número do canal aparece no código do eletrodo: 1A e 1B são do canal 1.',
      acao: { rotulo: 'Ver como identificar os eletrodos', para: '../eletrodos' },
    },
    {
      pergunta: 'Como interromper a aplicação?',
      destaque: 'Pressione STOP.',
      detalhe: 'Depois, pressione LIGA/DESLIGA para desligar. Em emergência, desligue direto na tecla LIGA/DESLIGA.',
      alerta: {
        titulo: 'Interrompa a estimulação',
        texto: 'Ardência, queimação, dor inesperada ou mal-estar: interrompa a saída e avalie antes de qualquer retomada.',
      },
    },
    {
      pergunta: 'Posso usar eletrodos de outra marca?',
      destaque: 'O fabricante recomenda os que acompanham o aparelho.',
      detalhe: 'Se precisar de outro tipo, prefira tamanho maior: eletrodo menor pode irritar e queimar a pele. Eletrodo autoadesivo precisa de registro na ANVISA.',
      acao: { rotulo: 'Ver recomendações sobre eletrodos', para: '../eletrodos' },
    },
    {
      pergunta: 'O que significa “FES” no aparelho?',
      destaque: 'Pode ser só o nome de um programa muscular.',
      detalhe: 'O nome do modo não garante sincronização com uma tarefa. Isso depende de coordenar a estimulação ao tempo da atividade.',
      acao: { rotulo: 'Ver o módulo FES', para: '/fes' },
    },
    {
      pergunta: 'Posso copiar os ajustes de outra pessoa?',
      destaque: 'Não há valor único de intensidade.',
      detalhe: 'Registre o número aplicado e a resposta observada. A intensidade depende da pessoa, da montagem e da tolerância.',
    },
  ],
  fontes: [M1],
}
