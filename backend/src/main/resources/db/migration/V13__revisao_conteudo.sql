-- Revisão editorial do conteúdo (guia técnico, seção 23): quem escreveu, quem revisou e por que um texto voltou.
-- autor_id nulo: texto do guia técnico, que entrou pelas migrations e não tem autor na plataforma.
-- revisor_id: quem aprovou ou devolveu por último pela plataforma. A data da aprovação continua em data_revisao.

alter table conteudo
    add column autor_id         uuid         references usuario (id),
    add column revisor_id       uuid         references usuario (id),
    add column motivo_devolucao varchar(500) check (length(trim(motivo_devolucao)) >= 1),
    add constraint conteudo_autor_nao_revisa check (autor_id is null or revisor_id is null or autor_id <> revisor_id);

-- Fila do revisor: o que está esperando revisão.
create index idx_conteudo_estado on conteudo (estado);
