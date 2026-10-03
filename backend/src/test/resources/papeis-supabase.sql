-- Papéis que o Supabase cria em todo projeto. A V1__seguranca_base.sql revoga permissões deles,
-- então o PostgreSQL de teste precisa tê-los para as migrations rodarem.
create role anon nologin;
create role authenticated nologin;
