-- Paciente (guia técnico, seção 17; arquitetura, seção 3). Só o profissional responsável lê e altera: a regra fica no
-- Spring (PacienteService). Paciente não é usuário: sem login e sem conta.

-- O Supabase já tem o schema "extensions"; o PostgreSQL dos testes não.
create schema if not exists extensions;
create extension if not exists unaccent with schema extensions;

-- unaccent() não é IMMUTABLE e por isso não entra em coluna gerada; este wrapper fixa o dicionário.
create function public.sem_acento(texto text) returns text
    language sql immutable parallel safe strict
    set search_path = ''
as $$ select extensions.unaccent('extensions.unaccent'::regdictionary, texto) $$;

create table paciente (
    id               uuid          primary key default gen_random_uuid(),
    responsavel_id   uuid          not null references usuario (id),
    nome             varchar(80)   not null check (length(trim(nome)) >= 1),
    sobrenome        varchar(120)  not null check (length(trim(sobrenome)) >= 1),
    identificador    varchar(40)   not null check (length(trim(identificador)) >= 1),
    telefone         varchar(20)   not null,
    email            varchar(254),
    data_nascimento  date          not null,
    criado_em        timestamptz   not null,
    criado_por       uuid          not null references usuario (id),
    alterado_em      timestamptz   not null,
    alterado_por     uuid          not null references usuario (id),
    excluido_em      timestamptz,
    busca            tsvector      generated always as (
        to_tsvector('simple', regexp_replace(public.sem_acento(nome || ' ' || sobrenome || ' ' || identificador), '[^[:alnum:]]+', ' ', 'g'))
    ) stored
);

-- Sinais viram espaço antes do to_tsvector: sem isso "CASO-77" vira os termos "caso" e "-77" (número negativo).
-- Único por responsável e só entre os não excluídos: o erro de duplicidade não revela paciente de outro profissional.
create unique index uq_paciente_identificador on paciente (responsavel_id, lower(identificador)) where excluido_em is null;
create index idx_paciente_responsavel on paciente (responsavel_id) where excluido_em is null;
create index idx_paciente_busca on paciente using gin (busca);

alter table paciente enable row level security;

-- Remoção definitiva 90 dias após a exclusão lógica. pg_cron roda dentro do banco (não depende do Render acordado).
-- O PostgreSQL dos testes não tem pg_cron: lá o agendamento é pulado.
do $$
begin
    if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
        create extension if not exists pg_cron;
        perform cron.schedule(
            'remover-pacientes-excluidos',
            '0 3 * * *',
            $job$delete from public.paciente where excluido_em < now() - interval '90 days'$job$
        );
    end if;
end
$$;
