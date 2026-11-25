# Banco de dados

- [V20](../backend/src/main/resources/db/migration/V20__sessao_dor_estruturada.sql) adiciona dor antes e depois (0 a 10), tarefa e momento. Sessões anteriores mantêm as medições textuais e ficam sem valores numéricos.
- [V21](../backend/src/main/resources/db/migration/V21__historico_alteracoes.sql) registra autor e data de edições de pacientes e avaliações na mesma transação da atualização. A chave por registro, data e autor permite consultar o histórico de cada registro. A migração recupera a última edição de registros existentes quando há data de alteração posterior à criação.

## Testes locais

Com Docker Desktop, a espera pela mensagem de inicialização do PostgreSQL pode expirar mesmo com o servidor pronto. [TestcontainersConfiguration](../backend/src/test/java/br/unibh/fisiotech/TestcontainersConfiguration.java) usa pg_isready via TCP para aguardar o servidor definitivo.
