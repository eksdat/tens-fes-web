-- Sessão de TENS, NMES ou FES (guia técnico, seções 16 e 18). A posse vem do paciente; o profissional é o do token.
-- A unidade fica no nome da coluna (Hz, µs, mA, minutos): o guia proíbe conversão silenciosa.

create table sessao (
    id                  uuid           primary key default gen_random_uuid(),
    paciente_id         uuid           not null references paciente (id) on delete cascade,
    data_hora           timestamptz    not null,
    objetivo            varchar(500)   not null,
    modalidade          varchar(10)    not null check (modalidade in ('TENS', 'NMES', 'FES')),
    aparelho            varchar(120)   not null,
    modo                varchar(60),
    duracao_real_min    numeric(5, 1)  not null check (duracao_real_min > 0 and duracao_real_min <= 240),
    eletrodo_tipo       varchar(80)    not null,
    eletrodo_dimensoes  varchar(40)    not null,
    lado                varchar(20)    not null check (lado in ('ESQUERDO', 'DIREITO', 'BILATERAL', 'NAO_SE_APLICA')),
    marcos              varchar(300)   not null,
    -- Prancha do atlas usada como base (features/atlas/montagens.ts); opcional.
    montagem_id         varchar(40),
    sensacao            varchar(500),
    contracao           varchar(500),
    tolerancia          varchar(500),
    fadiga              varchar(500),
    ajustes             varchar(500),
    medida_antes        varchar(200),
    medida_depois       varchar(200),
    medida_contexto     varchar(300),
    condicao_pele       varchar(300)   not null,
    motivo_termino      varchar(300)   not null,
    plano_reavaliacao   varchar(500)   not null,
    criado_em           timestamptz    not null,
    criado_por          uuid           not null references usuario (id),
    alterado_em         timestamptz    not null,
    alterado_por        uuid           not null references usuario (id)
);

create index idx_sessao_paciente on sessao (paciente_id, data_hora desc);

create table sessao_canal (
    sessao_id             uuid           not null references sessao (id) on delete cascade,
    canal                 smallint       not null check (canal in (1, 2)),
    frequencia_hz         numeric(6, 1)  not null check (frequencia_hz > 0 and frequencia_hz <= 1000),
    largura_pulso_us      integer        not null check (largura_pulso_us > 0 and largura_pulso_us <= 1000),
    amplitude_inicial_ma  numeric(5, 1)  check (amplitude_inicial_ma >= 0 and amplitude_inicial_ma <= 100),
    amplitude_final_ma    numeric(5, 1)  not null check (amplitude_final_ma >= 0 and amplitude_final_ma <= 100),
    par                   varchar(20)    not null,
    primary key (sessao_id, canal)
);

-- Itens do checklist de segurança marcados na sessão ("Etapa:texto do item").
create table sessao_checklist (
    sessao_id  uuid          not null references sessao (id) on delete cascade,
    item       varchar(300)  not null,
    primary key (sessao_id, item)
);

alter table sessao enable row level security;
alter table sessao_canal enable row level security;
alter table sessao_checklist enable row level security;
