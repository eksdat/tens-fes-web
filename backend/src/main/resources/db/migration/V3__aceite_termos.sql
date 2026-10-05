-- Aceite dos Termos de uso e da Política de privacidade (LGPD: provar o que o usuário aceitou e quando).
-- Nulo só para cadastros anteriores a esta migration; a API exige o aceite em todo cadastro novo.
alter table usuario
    add column termos_aceitos_em timestamptz,
    add column termos_versao     varchar(20),
    add constraint usuario_aceite_termos_completo
        check ((termos_aceitos_em is null) = (termos_versao is null));
