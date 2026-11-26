create table paciente_alteracao (
    paciente_id uuid not null references paciente(id) on delete cascade,
    autor uuid not null references usuario(id),
    data_hora timestamptz not null,
    primary key (paciente_id, data_hora, autor)
);

create table avaliacao_alteracao (
    avaliacao_id uuid not null references avaliacao(id) on delete cascade,
    autor uuid not null references usuario(id),
    data_hora timestamptz not null,
    primary key (avaliacao_id, data_hora, autor)
);

alter table paciente_alteracao enable row level security;
alter table avaliacao_alteracao enable row level security;

insert into paciente_alteracao (paciente_id, autor, data_hora)
select id, alterado_por, alterado_em from paciente where alterado_em > criado_em;

insert into avaliacao_alteracao (avaliacao_id, autor, data_hora)
select id, alterado_por, alterado_em from avaliacao where alterado_em > criado_em;
