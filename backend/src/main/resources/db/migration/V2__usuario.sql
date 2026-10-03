-- Dados do usuário que não estão no Supabase Auth. E-mail, senha e MFA ficam em auth.users.
-- id = auth.users.id (claim "sub" do JWT). Sem FK para auth.users: o schema do sistema não depende do schema interno do Supabase.
create table usuario (
    id            uuid         primary key,
    nome          varchar(120) not null check (length(trim(nome)) >= 2),
    perfil        varchar(20)  not null check (perfil in ('ESTUDANTE', 'PROFISSIONAL')),
    revisor       boolean      not null default false,
    ativo         boolean      not null default true,

    instituicao   varchar(120),
    periodo       smallint     check (periodo between 1 and 12),

    categoria     varchar(30)  check (categoria in ('FISIOTERAPEUTA', 'TERAPEUTA_OCUPACIONAL', 'OUTRA')),
    registro      varchar(20),
    uf            char(2)      check (uf in ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
                                             'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),

    criado_em     timestamptz  not null default now(),
    atualizado_em timestamptz  not null default now(),

    -- Dados de estudante continuam gravados depois da troca para PROFISSIONAL (histórico de formação),
    -- por isso a regra só exige, nunca proíbe.
    constraint usuario_estudante_completo
        check (perfil <> 'ESTUDANTE' or (instituicao is not null and periodo is not null)),
    constraint usuario_profissional_completo
        check (perfil <> 'PROFISSIONAL' or (categoria is not null and registro is not null and uf is not null)),
    constraint usuario_revisor_profissional
        check (not revisor or perfil = 'PROFISSIONAL')
);
