-- Tabela de conteúdo técnico dos módulos TENS e FES (textos do guia técnico, todos em revisão)

create table conteudo (
    id             uuid          primary key default gen_random_uuid(),
    titulo         varchar(200)  not null check (length(trim(titulo)) >= 2),
    modalidade     varchar(10)   not null check (modalidade in ('TENS', 'NMES', 'FES')),
    secao          varchar(20)   not null check (secao in ('VISAO_GERAL', 'APARELHO', 'ELETRODOS', 'PARAMETROS', 'SEGURANCA', 'CASOS')),
    ordem          integer       not null check (ordem >= 1),
    corpo          text          not null,
    referencias    text,
    versao         integer       not null default 1 check (versao >= 1),
    estado         varchar(20)   not null default 'RASCUNHO' check (estado in ('RASCUNHO', 'EM_REVISAO', 'APROVADO', 'ARQUIVADO')),
    data_revisao   date,
    criado_em      timestamptz   not null default now(),
    atualizado_em  timestamptz   not null default now(),
    constraint conteudo_aprovado_com_data_revisao check (estado <> 'APROVADO' or data_revisao is not null)
);

create index idx_conteudo_modalidade_estado on conteudo (modalidade, estado);

alter table conteudo enable row level security;

-- TENS

insert into conteudo (titulo, modalidade, secao, ordem, corpo, referencias, estado) values
(
    'O que é TENS', 'TENS', 'VISAO_GERAL', 1,
    $$TENS significa estimulação elétrica nervosa transcutânea. Utiliza eletrodos de superfície para estimular nervos e auxiliar no alívio da dor. A resposta e a tolerância devem ser acompanhadas durante a aplicação.$$,
    '[R1] Johnson, 2007', 'EM_REVISAO'
),
(
    'Como o TENS age na dor', 'TENS', 'VISAO_GERAL', 2,
    $$Os estímulos sensoriais podem modular a transmissão de informações relacionadas à dor na medula e em circuitos de modulação do sistema nervoso. O TENS convencional busca uma sensação forte e confortável.

A explicação de "fechar a comporta da dor" é uma analogia didática, não um bloqueio completo ou permanente.$$,
    '[R1] Johnson, 2007', 'EM_REVISAO'
),
(
    'O que a evidência mostra', 'TENS', 'VISAO_GERAL', 3,
    $$A revisão meta-TENS encontrou redução de dor durante ou imediatamente após a aplicação, em comparação com placebo. Isso não demonstra benefício duradouro para todas as condições nem substitui tratamento ativo e avaliação da causa da dor.$$,
    '[R2] Johnson et al., 2022 (meta-TENS)', 'EM_REVISAO'
),
(
    'Perguntas frequentes', 'TENS', 'VISAO_GERAL', 4,
    $$| Pergunta | Resposta |
| --- | --- |
| TENS fortalece músculos? | O objetivo do TENS neste módulo é analgesia. Contração incidental não transforma uma aplicação em treino de força. |
| Serve apenas para dor crônica? | A duração da dor não determina sozinha a modalidade. A indicação depende do contexto. |
| Pode doer? | No modo convencional, espera-se formigamento forte e confortável, sem queimação ou dor. |
| Qual intensidade em mA? | Não há valor único. Registre o número aplicado e a resposta observada; não copie a intensidade de outra pessoa. |$$,
    '[R1] Johnson, 2007', 'EM_REVISAO'
),
(
    'Modos de TENS e faixas educativas', 'TENS', 'PARAMETROS', 1,
    $$| Modo | Faixa de referência | Objetivo e resposta |
| --- | --- | --- |
| Convencional | 50–100 Hz; 50–200 µs | Analgesia com parestesia forte, confortável e não dolorosa |
| Tipo acupuntura | 2–4 Hz; 100–400 µs | Analgesia com contrações rítmicas toleráveis; exige seleção do contexto |
| Burst (rajadas) | 2–4 rajadas/s; pulsos internos de 100–200 Hz | Grupos de pulsos: distinguir a frequência da rajada e a dos pulsos |
| Modulado | Variação programada de frequência, largura e/ou amplitude | Não é uma faixa universal: descrever o que o aparelho realmente modifica |

São faixas educativas, não prescrição. O rótulo comercial do programa não garante os mesmos valores: conferir o manual antes de reproduzir qualquer preset.

O TENS intenso existe na literatura, mas não faz parte do simulador inicial. Buscar dor não é meta do TENS convencional.$$,
    '[R1] Johnson, 2007', 'EM_REVISAO'
),
(
    'Exemplo didático de configuração', 'TENS', 'PARAMETROS', 2,
    $$Caso fictício: adulto com dor localizada no joelho, já avaliado, com pele íntegra e sensibilidade preservada.

Ajustes do exercício: TENS convencional, 80 Hz, 100 µs, 20 minutos. A intensidade começa em zero e é ajustada até uma parestesia forte e confortável.

Justificativa: praticar o ajuste sensorial e o registro da resposta. Os 20 minutos foram escolhidos para este exercício e não são regra clínica.$$,
    'Guia técnico TENS + FES, seção 07', 'EM_REVISAO'
),
(
    'O que registrar em toda aplicação', 'TENS', 'PARAMETROS', 3,
    $$Modalidade, modo, frequência, largura de fase ou de pulso (conforme o manual), intensidade por canal, duração, localização, resposta sensorial e avaliação da dor.

No modo burst, registrar os dois níveis de frequência quando o aparelho os mostrar.$$,
    'Guia técnico TENS + FES, seção 07', 'EM_REVISAO'
),
(
    'Caso 1: dor localizada e TENS', 'TENS', 'CASOS', 1,
    $$**Enunciado (fictício):** adulto avaliado, com dor no joelho durante uma tarefa, pele íntegra e sensibilidade preservada, sem riscos identificados no cenário. Deseja-se estudar analgesia. Qual resposta procurar e como registrar?

**Resposta comentada:** no exercício de TENS convencional, buscar parestesia forte e confortável. Usar os ajustes do exemplo didático, justificar o posicionamento e registrar a dor na mesma tarefa, antes e depois. A intensidade não pode ser definida copiando os mA de outro caso.$$,
    'Guia técnico TENS + FES, seção 14', 'EM_REVISAO'
);

-- FES e NMES

insert into conteudo (titulo, modalidade, secao, ordem, corpo, referencias, estado) values
(
    'O que é FES', 'FES', 'VISAO_GERAL', 1,
    $$FES significa estimulação elétrica funcional. A estimulação produz ativação muscular coordenada com uma tarefa, como elevar o antepé na marcha ou abrir a mão para soltar um objeto.$$,
    '[R3] Nussbaum et al., 2017', 'EM_REVISAO'
),
(
    'Diferença entre NMES e FES', 'FES', 'VISAO_GERAL', 2,
    $$| Termo | Significado |
| --- | --- |
| NMES (EENM) | Estimulação elétrica neuromuscular: procura produzir contração para objetivos como ativação e treino muscular. |
| FES (EEF) | Uso funcional da estimulação neuromuscular, organizado no tempo da atividade. |
| Exemplo de NMES | Contrações do quadríceps em exercício isolado. |
| Exemplo de FES | Estimulação dos dorsiflexores coordenada à fase de balanço da marcha. |
| "FES" no aparelho | Pode ser só o nome comercial de um programa muscular. É preciso verificar se há sincronização real com uma tarefa. |

Os protocolos de NMES não devem ser transferidos de uma população para outra sem critério.$$,
    '[R3] Nussbaum et al., 2017', 'EM_REVISAO'
),
(
    'Alvos funcionais', 'FES', 'VISAO_GERAL', 3,
    $$- **Dorsiflexão:** elevação do antepé.
- **Extensão de joelho:** endireitamento do joelho.
- **Extensão do punho e dos dedos:** movimento de abrir ou posicionar a mão.

A tarefa deve ser descrita com início, término, assistência e resposta.$$,
    'Guia técnico TENS + FES, seção 08', 'EM_REVISAO'
),
(
    'Limites que mudam a decisão', 'FES', 'VISAO_GERAL', 4,
    $$A estimulação usual de superfície depende de uma via motora periférica responsiva. Fraqueza por lesão central e desnervação periférica não são equivalentes.

A ausência de contração não autoriza aumentar a corrente indefinidamente. Na marcha, sistemas dedicados podem usar sensores e temporização própria.$$,
    '[R3] Nussbaum et al., 2017; [R5] NICE MIB56, 2016', 'EM_REVISAO'
),
(
    'Parâmetros motores: como se relacionam', 'FES', 'PARAMETROS', 1,
    $$| Campo | Referência educativa, sem prescrição universal |
| --- | --- |
| Frequência | Faixas de aproximadamente 20–50 Hz são usadas em muitos contextos motores; protocolos podem empregar outros valores. Buscar contração útil sem aumentar a fadiga desnecessariamente. |
| Duração de fase/pulso | Valores de centenas de microssegundos, frequentemente 200–400 µs, aparecem em aplicações de músculos inervados. Conferir a convenção do aparelho. |
| Amplitude | Ajustar à contração e à tarefa, dentro da tolerância e da segurança. Nenhum valor fixo em mA serve para todos. |
| Trabalho e repouso | A relação depende do objetivo, da fadiga e da tarefa. Na marcha, o acionamento segue os eventos do passo. |
| Rampas | Transições graduais podem aumentar o conforto. Rampas longas podem atrasar uma tarefa rápida. |

São faixas introdutórias sintetizadas para ensino e não correspondem a um protocolo único.$$,
    '[R3] Nussbaum et al., 2017', 'EM_REVISAO'
),
(
    'Exercício A: ativação de quadríceps', 'NMES', 'PARAMETROS', 2,
    $$Exemplo didático, sem prescrição: 35 Hz; 300 µs; subida 2 s; platô 6 s; descida 2 s; repouso 30 s; 8 ciclos.

O período com estímulo (ON) é de 10 s, incluindo as rampas. Cada ciclo tem 40 s, e o exercício totaliza 320 s (5 min 20 s). A intensidade é ajustada à contração tolerável no caso fictício.

Classifica-se como NMES porque não há tarefa funcional integrada.$$,
    '[R3] Nussbaum et al., 2017', 'EM_REVISAO'
),
(
    'Exercício B: abertura da mão', 'FES', 'PARAMETROS', 3,
    $$Exemplo didático, sem prescrição: 30 Hz; 250 µs; subida 1 s; platô 3 s; descida 1 s; repouso 15 s; 6 ciclos.

Durante a fase ativa, a pessoa abre a mão e solta um objeto leve, com assistência prevista. Como há uma tarefa explícita, o exercício permite discutir FES.

Avaliar a seletividade: extensão útil, conforto e ausência de postura indesejada.$$,
    '[R3] Nussbaum et al., 2017', 'EM_REVISAO'
),
(
    'Caso 2: contração de quadríceps', 'NMES', 'CASOS', 1,
    $$**Enunciado (fictício):** cenário de ativação muscular sem restrição articular, com contração periférica preservada. O estudante aplica o Exercício A. Isso é FES?

**Resposta comentada:** contração isolada caracteriza NMES no contexto apresentado. Para discutir FES, é preciso especificar uma tarefa e a sincronização. Registrar movimento, assistência, tolerância e queda de resposta ao longo dos ciclos.$$,
    'Guia técnico TENS + FES, seção 14', 'EM_REVISAO'
),
(
    'Caso 3: pé caído', 'FES', 'CASOS', 2,
    $$**Enunciado (fictício):** pessoa após lesão central apresenta dificuldade para elevar o antepé na marcha. O caso não descreve avaliação periférica nem recursos de sincronização.

**Resposta comentada:** faltam dados para propor uma configuração funcional. Perguntar sobre resposta motora, amplitude, segurança da marcha, avaliação profissional e equipamento. Não recomendar simplesmente "aumentar Hz".$$,
    'Guia técnico TENS + FES, seção 14', 'EM_REVISAO'
);

-- Comum aos dois módulos (entra uma vez para TENS e uma para FES)

insert into conteudo (titulo, modalidade, secao, ordem, corpo, referencias, estado)
select comum.titulo, modulo.modalidade, comum.secao, comum.ordem, comum.corpo, comum.referencias, 'EM_REVISAO'
from (values
(
    'Componentes do aparelho', 'APARELHO', 1,
    $$| Peça | Função |
| --- | --- |
| 1. Liga/desliga | Alimenta o equipamento. Ligar não equivale a iniciar a estimulação. |
| 2. Visor | Mostra modalidade, parâmetros, tempo e estado da saída. |
| 3. Seletor de modo | Escolhe a modalidade ou o programa disponível. |
| 4 e 5. Ajustes | Navegam e alteram os parâmetros; a disposição depende do modelo. |
| 6. Iniciar/pausar | Controla a sessão conforme o manual, incluindo o comando de interrupção. |
| 7 e 8. Saídas dos canais | Conectam os cabos dos canais 1 e 2, cada um com seu par de eletrodos. |

Os cabos conduzem os pulsos, os conectores unem aparelho, cabos e eletrodos, e os eletrodos fazem a interface com a pele. A bateria ou fonte fornece energia ao equipamento.

Este é um aparelho conceitual, sem marca. A localização física das peças depende do manual do modelo escolhido.$$,
    'Guia técnico TENS + FES, seção 09'
),
(
    'Conexões, eletrodos e acessórios', 'APARELHO', 2,
    $$| Item | Explicação |
| --- | --- |
| Canal | Circuito de saída identificado. Um canal usualmente usa dois eletrodos; a quantidade e a independência dependem do aparelho. |
| Cabo bifurcado | Conecta o par de eletrodos à saída correspondente. Conferir encaixe e integridade antes do uso. |
| Eletrodo autoadesivo | Superfície condutora com gel adesivo. Reutilização, conservação e vida útil seguem o fabricante. |
| Eletrodo de silicone/carbono | Requer meio condutor e fixação compatíveis com o manual. Não é intercambiável sem conferir os acessórios. |
| Conector | Pino, encaixe ou conexão compatível. Não improvisar adaptadores. |
| Fonte/bateria | Fornece energia ao aparelho. A tensão da rede não é dose terapêutica. |
| Intensidade do canal | Ajuste de amplitude da saída. Começa em zero e não deve continuar ativa ao trocar a montagem. |$$,
    'Guia técnico TENS + FES, seções 09 e 10'
),
(
    'Como ler os termos do atlas', 'ELETRODOS', 1,
    $$| Termo | Definição |
| --- | --- |
| Anterior / posterior / lateral | Frente / costas / lado do corpo, sempre pela orientação da pessoa representada. |
| Proximal / distal | Mais próximo / mais distante da raiz do membro. |
| Medial / lateral | Mais perto / mais longe da linha central do corpo. |
| Ventre muscular | Porção contrátil mais volumosa do músculo. |
| Tendão | Estrutura que transmite força; não equivale ao ventre muscular para localizar a resposta. |
| Ponto motor | Região em que a estimulação gera contração com menor intensidade relativa. Varia entre pessoas e exige localização funcional. |
| Dermátomo / miótomo | Área de pele / conjunto muscular relacionados a uma raiz nervosa. Não são sinônimos de músculo e nervo periférico. |

O desenho orienta a leitura; a posição final depende da avaliação, do ajuste ao corpo e da resposta.$$,
    'Guia técnico TENS + FES, seção 11'
),
(
    'Legenda dos pares e o que registrar', 'ELETRODOS', 2,
    $$**Legenda obrigatória:** 1A e 1B formam o canal 1; 2A e 2B formam o canal 2. A cor é só um reforço: os códigos aparecem sempre. As letras A e B identificam os eletrodos e não significam polo positivo ou negativo. Em correntes bifásicas balanceadas não há polaridade fixa como na corrente contínua; seguir o manual.

**O que registrar:** tipo, formato, dimensões em cm, quantidade, canal, lado, região e posição. Não sobrepor eletrodos nem permitir contato entre as bordas. Tamanho e espaçamento variam com a anatomia, o alvo e as instruções do fabricante.$$,
    'Guia técnico TENS + FES, seção 11'
),
(
    'Antes da aplicação', 'SEGURANCA', 1,
    $$A triagem distingue impedimento, precaução e necessidade de avaliação especializada. As regras combinam modalidade, região, condição e manual.

| Situação | Conduta |
| --- | --- |
| Dispositivo eletrônico implantado | Não liberar exemplo genérico: o risco de interferência exige análise específica do dispositivo, da região e da equipe responsável. |
| Suspeita de trombose ativa | Interromper o caminho de aplicação e orientar avaliação; evitar estimulação sobre a região suspeita. |
| Pescoço anterior, olhos ou trajeto pelo tórax | Não há montagens nessas regiões neste conteúdo. |
| Gestação | Não usar montagem abdominal ou lombopélvica do conteúdo geral. Situações obstétricas exigem protocolo e supervisão específicos. |
| Pele lesionada ou infecção local | Não aplicar eletrodo comum como se a pele fosse íntegra. |
| Sensibilidade ou comunicação comprometida | Aumenta a necessidade de avaliação e monitorização; não confiar apenas em "está confortável". |
| Cirurgia, fratura ou reparo recente | Considerar a carga mecânica da contração e as restrições do procedimento. |
| Tumor na região, epilepsia ou condição complexa | Exigem análise clínica contextualizada, sem liberação automática. |

**Checklist:** objetivo definido? Riscos avaliados? Pele e sensibilidade examinadas? Cabos e eletrodos íntegros? Intensidade em zero antes da conexão? Pessoa orientada a relatar desconforto?$$,
    '[R4] Houghton, Nussbaum e Hoens, 2010'
),
(
    'Durante e depois da aplicação', 'SEGURANCA', 2,
    $$**Durante:** monitorar o relato, a pele quando necessário, a qualidade do contato e a resposta. Na estimulação motora, acompanhar movimento, compensações, fadiga e segurança da tarefa. Se houver queimação, dor inesperada, mal-estar, alteração relevante da pele ou movimento inseguro, interromper a saída e avaliar antes de qualquer retomada.

**Depois:** zerar ou interromper a saída antes de retirar os eletrodos, conforme o manual. Observar a pele e registrar a resposta, a dose realizada e as intercorrências. Higienização, descarte, armazenamento e reutilização dependem do acessório e do fabricante.

| Situação | O que fazer |
| --- | --- |
| Ardência ou queimação | Interromper a estimulação e verificar pele, eletrodo e contato. |
| Perda de resposta motora | Revisar fadiga, montagem e contexto. Não aumentar a amplitude automaticamente. |
| Risco não esclarecido | A avaliação de segurança está incompleta: concluir a análise antes de registrar a aplicação. |
| Troca de eletrodos | Interromper a saída antes de modificar a montagem. |
| Fim da sessão | Registrar a condição da pele, a resposta e os ajustes realizados. |$$,
    '[R4] Houghton, Nussbaum e Hoens, 2010'
),
(
    'O que fica fora destes módulos', 'SEGURANCA', 3,
    $$Estimulação intracavitária vaginal ou anal, aplicações obstétricas, tratamento de feridas e músculos desnervados não estão cobertos por estes conteúdos nem pelos exercícios. Esses usos precisam de módulos, acessórios e referências próprios. Não extrapolar parâmetros de superfície para eles.$$,
    'Guia técnico TENS + FES, seção 20'
),
(
    'Caso 4: queimação sob o eletrodo', 'CASOS', 3,
    $$**Enunciado (fictício):** durante o exercício, aparece ardência localizada sob o eletrodo.

**Resposta comentada:** interromper a saída e inspecionar pele, contato e material. Não normalizar a queixa nem compensar com maior amplitude. Encerrar o cenário e registrar a intercorrência.$$,
    'Guia técnico TENS + FES, seção 14'
)
) as comum(titulo, secao, ordem, corpo, referencias)
cross join (values ('TENS'), ('FES')) as modulo(modalidade);
