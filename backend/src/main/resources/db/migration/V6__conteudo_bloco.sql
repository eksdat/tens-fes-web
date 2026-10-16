-- Blocos da página técnica (guia técnico, seção 06): O que é, Para que serve, Como interpretar, Exemplo, Cuidados.
-- Nulo nas linhas que não compõem uma página padrão (outras abas e as perguntas frequentes).

alter table conteudo
    add column bloco varchar(20)
        check (bloco in ('O_QUE_E', 'PARA_QUE_SERVE', 'COMO_INTERPRETAR', 'EXEMPLO', 'CUIDADOS'));

-- Um bloco por página: a página não pode ter dois "O que é".
create unique index uq_conteudo_pagina_bloco on conteudo (modalidade, secao, bloco) where bloco is not null;

update conteudo set bloco = 'O_QUE_E'          where modalidade = 'TENS' and secao = 'VISAO_GERAL' and titulo = 'O que é TENS';
update conteudo set bloco = 'PARA_QUE_SERVE'   where modalidade = 'TENS' and secao = 'VISAO_GERAL' and titulo = 'O que a evidência mostra';
update conteudo set bloco = 'COMO_INTERPRETAR' where modalidade = 'TENS' and secao = 'VISAO_GERAL' and titulo = 'Como o TENS age na dor';

update conteudo set bloco = 'O_QUE_E'          where modalidade = 'FES' and secao = 'VISAO_GERAL' and titulo = 'O que é FES';
update conteudo set bloco = 'PARA_QUE_SERVE'   where modalidade = 'FES' and secao = 'VISAO_GERAL' and titulo = 'Alvos funcionais';
update conteudo set bloco = 'COMO_INTERPRETAR' where modalidade = 'FES' and secao = 'VISAO_GERAL' and titulo = 'Diferença entre NMES e FES';
update conteudo set bloco = 'CUIDADOS'         where modalidade = 'FES' and secao = 'VISAO_GERAL' and titulo = 'Limites que mudam a decisão';

-- Blocos que faltavam, com texto do guia (seções 07 e 08). Entram em revisão como o resto.
insert into conteudo (titulo, modalidade, secao, bloco, corpo, referencias, estado) values
(
    'Exemplo didático', 'TENS', 'VISAO_GERAL', 'EXEMPLO',
    $$Caso fictício: adulto com dor localizada no joelho, já avaliado, com pele íntegra e sensibilidade preservada.

Ajustes do exercício: TENS convencional, 80 Hz, 100 µs, 20 minutos. A intensidade começa em zero e é ajustada até uma parestesia forte e confortável.

Os 20 minutos foram escolhidos para este exercício e não são regra clínica.$$,
    'Guia técnico TENS + FES, seção 07', 'EM_REVISAO'
),
(
    'Cuidados', 'TENS', 'VISAO_GERAL', 'CUIDADOS',
    $$- No modo convencional, espera-se formigamento forte e confortável, sem queimação ou dor.
- Acompanhe a resposta e a tolerância durante toda a aplicação.
- Não há intensidade única em mA: registre o valor aplicado e a resposta, sem copiar a intensidade de outra pessoa.
- Confira o manual antes de reproduzir qualquer preset. Buscar dor não é meta do TENS convencional.$$,
    '[R1] Johnson, 2007; Guia técnico TENS + FES, seção 07', 'EM_REVISAO'
),
(
    'Exemplo didático', 'FES', 'VISAO_GERAL', 'EXEMPLO',
    $$Exercício fictício de abertura da mão: 30 Hz, 250 µs, subida 1 s, platô 3 s, descida 1 s, repouso 15 s, 6 ciclos.

Durante a fase ativa, a pessoa abre a mão e solta um objeto leve, com assistência prevista. Há tarefa explícita, o que permite discutir FES. Avalie a seletividade: extensão útil, conforto e ausência de postura indesejada.$$,
    'Guia técnico TENS + FES, seção 08; [R3] Nussbaum et al., 2017', 'EM_REVISAO'
);
