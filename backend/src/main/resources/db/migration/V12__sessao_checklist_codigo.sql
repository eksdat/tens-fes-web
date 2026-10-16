-- O item do checklist passa a ser guardado por código fixo ("antes.objetivo-definido"), não pelo texto da pergunta:
-- mudar a redação no site não pode alterar o que já foi registrado. Converte as sessões que usavam "Etapa:texto".
update sessao_checklist set item = case item
    when 'Antes:Objetivo definido?' then 'antes.objetivo-definido'
    when 'Antes:Riscos avaliados?' then 'antes.riscos-avaliados'
    when 'Antes:Paciente orientado a relatar desconforto?' then 'antes.paciente-orientado'
    when 'Antes:Impedimentos da triagem descartados?' then 'antes.impedimentos-descartados'
    when 'Antes:Precauções identificadas e registradas?' then 'antes.precaucoes-registradas'
    when 'Antes:Pele e sensibilidade examinadas?' then 'antes.pele-examinada'
    when 'Antes:Cabos e eletrodos íntegros?' then 'antes.cabos-eletrodos-integros'
    when 'Antes:Intensidade em zero antes da conexão?' then 'antes.intensidade-zero'
    when 'Durante:Monitore o relato, o contato dos eletrodos e a resposta.' then 'durante.monitorar-relato-contato-resposta'
    when 'Durante:Na estimulação motora, acompanhe movimento, compensações, fadiga e segurança da tarefa.' then 'durante.acompanhar-movimento-fadiga'
    when 'Durante:Observe a pele quando necessário.' then 'durante.observar-pele'
    when 'Durante:Se houver queimação, dor inesperada, mal-estar, alteração cutânea relevante ou movimento inseguro, interrompa a saída e avalie antes de retomar.' then 'durante.interromper-se-queimacao'
    when 'Depois:Observe a pele depois da retirada.' then 'depois.observar-pele'
    when 'Depois:Registre a resposta, a dose efetivamente realizada e as intercorrências.' then 'depois.registrar-resposta-dose'
    when 'Depois:Zere ou interrompa a saída antes de retirar os eletrodos, conforme o manual.' then 'depois.zerar-saida-antes-de-retirar'
    when 'Depois:Higienize, descarte ou guarde o material conforme as instruções do fabricante.' then 'depois.cuidar-do-material'
    else item
end;
