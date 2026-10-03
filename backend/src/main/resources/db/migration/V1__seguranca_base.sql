-- Só o backend (usuário postgres) acessa o schema public. A publishable key do frontend
-- (papéis anon e authenticated) não pode ler, escrever nem executar nada aqui.
-- Ver SEGURANCA.md, seção 2.

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated, public;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated, public;
