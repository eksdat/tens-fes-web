-- Avaliação inicial (guia técnico, seção 17). Um paciente tem várias (reavaliação). A posse vem do paciente.
-- Regra dos campos: "não avaliado", "ausente" e "presente" são estados diferentes; campo vazio nunca vira ausência.

create table avaliacao (
    id               uuid           primary key default gen_random_uuid(),
    paciente_id      uuid           not null references paciente (id) on delete cascade,
    data_avaliacao   date           not null,
    queixa           varchar(2000),
    historico        varchar(2000),
    -- Nulo = dor não avaliada. Zero é "sem dor", nunca o valor de um campo vazio.
    dor_escala       smallint       check (dor_escala between 0 and 10),
    dor_contexto     varchar(500),
    dor_tarefa       varchar(500),
    dor_momento      varchar(500),
    objetivo         varchar(2000),
    plano            varchar(2000),
    criado_em        timestamptz    not null,
    criado_por       uuid           not null references usuario (id),
    alterado_em      timestamptz    not null,
    alterado_por     uuid           not null references usuario (id)
);

create index idx_avaliacao_paciente on avaliacao (paciente_id, data_avaliacao desc);

create table avaliacao_triagem (
    avaliacao_id  uuid         not null references avaliacao (id) on delete cascade,
    item          varchar(40)  not null check (item in ('DISPOSITIVO_IMPLANTADO', 'GESTACAO', 'SUSPEITA_TROMBOSE',
                                                       'INFECCAO', 'ALTERACAO_PELE_SENSIBILIDADE', 'RESTRICOES')),
    estado        varchar(20)  not null check (estado in ('NAO_AVALIADO', 'AUSENTE', 'PRESENTE')),
    primary key (avaliacao_id, item)
);

create table avaliacao_achado (
    avaliacao_id  uuid          not null references avaliacao (id) on delete cascade,
    ordem         integer       not null,
    bloco         varchar(30)   not null check (bloco in ('PELE_SENSIBILIDADE', 'FUNCAO_MOTORA')),
    descricao     varchar(200)  not null,
    estado        varchar(20)   not null check (estado in ('NAO_AVALIADO', 'AUSENTE', 'PRESENTE')),
    lado          varchar(20)   not null check (lado in ('ESQUERDO', 'DIREITO', 'BILATERAL', 'NAO_SE_APLICA')),
    regiao        varchar(100)  not null,
    metodo        varchar(100)  not null,
    primary key (avaliacao_id, ordem)
);

alter table avaliacao enable row level security;
alter table avaliacao_triagem enable row level security;
alter table avaliacao_achado enable row level security;
