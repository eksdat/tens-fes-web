create table caso_clinico (
    id uuid primary key,
    estudante_id uuid not null references usuario(id),
    criado_em timestamptz not null default now(),
    titulo varchar(120) not null,
    objetivo text not null,
    contexto text not null,
    avaliacao text not null,
    modalidade varchar(4) not null check (modalidade in ('TENS', 'NMES', 'FES')),
    parametros text not null,
    montagem text not null,
    justificativa text not null,
    duvida text not null
);
create index caso_clinico_estudante on caso_clinico (estudante_id, criado_em desc);
alter table caso_clinico enable row level security;

create table caso_clinico_anexo (
    id uuid primary key,
    caso_id uuid not null references caso_clinico(id) on delete cascade,
    nome varchar(160) not null,
    mime varchar(32) not null,
    dados bytea not null check (octet_length(dados) between 1 and 10485760)
);
create index caso_clinico_anexo_caso on caso_clinico_anexo (caso_id);
alter table caso_clinico_anexo enable row level security;
