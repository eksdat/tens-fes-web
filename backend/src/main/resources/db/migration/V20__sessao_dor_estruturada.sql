alter table public.sessao
    add column dor_antes integer check (dor_antes between 0 and 10),
    add column dor_depois integer check (dor_depois between 0 and 10),
    add column dor_tarefa varchar(200),
    add column dor_momento varchar(200),
    add constraint sessao_dor_protocolo check (
        (dor_antes is null and dor_depois is null) or
        (nullif(btrim(dor_tarefa), '') is not null and nullif(btrim(dor_momento), '') is not null)
    );
