-- Material de estudo (tela "Criar conteúdo"; guia técnico, seções 03 e 23). O material é uma linha de "conteudo"
-- com autor e sem bloco de página técnica: nasce em RASCUNHO, o autor envia (EM_REVISAO) e entra na mesma fila do
-- revisor. Os anexos ficam no Supabase Storage; aqui só os dados do arquivo (SEGURANCA.md, seção 3).

create table anexo (
    id             uuid          primary key default gen_random_uuid(),
    conteudo_id    bigint        not null references conteudo (id) on delete cascade,
    -- Nome que a pessoa deu ao arquivo, só para mostrar. O caminho no bucket é gerado pelo servidor.
    nome           varchar(200)  not null check (length(trim(nome)) >= 1),
    -- Conferido pelos primeiros bytes do arquivo, não pela extensão.
    tipo           varchar(10)   not null check (tipo in ('PDF', 'PNG', 'JPEG')),
    tamanho_bytes  integer       not null check (tamanho_bytes between 1 and 10485760),
    caminho        varchar(200)  not null unique,
    criado_em      timestamptz   not null default now()
);

create index idx_anexo_conteudo on anexo (conteudo_id);
create index idx_conteudo_autor on conteudo (autor_id) where autor_id is not null;

alter table anexo enable row level security;

-- Bucket privado, só o backend usa (com a chave secreta). O próprio bucket também barra tipo e tamanho.
-- O PostgreSQL dos testes não tem o schema "storage" do Supabase: lá o bucket é pulado.
do $$
begin
    if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'buckets') then
        insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        values ('materiais', 'materiais', false, 10485760, array['application/pdf', 'image/png', 'image/jpeg'])
        on conflict (id) do nothing;
    end if;
end
$$;
