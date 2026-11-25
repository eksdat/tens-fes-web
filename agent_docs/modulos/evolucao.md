# Evolução e relatório

Na ficha do paciente, [SessoesDoPaciente](../../frontend/src/features/sessao/SessoesDoPaciente.tsx) lista sessões com data, autor e modalidade. [Evolucao](../../frontend/src/features/sessao/Evolucao.tsx) mostra as séries Antes e Depois na ordem das sessões, em escala de 0 a 10, e a tabela equivalente com tarefa, momento e contexto. O gráfico liga apenas medidas consecutivas com a mesma tarefa, momento e contexto.

A sessão aceita dor de 0 a 10. Se houver valor antes ou depois, tarefa e momento são obrigatórios. O campo vazio permanece nulo.

O formulário pode registrar um planejamento opcional separado da aplicação: relato, largura de pulso planejada e referência de uma ficha local após confirmação dos critérios. Os canais continuam representando somente os valores efetivamente aplicados; sessões sem planejamento não enviam esse campo.

A [interpretação do relato](../../frontend/src/features/casos/interpretarRelato.ts) exige a condição estudada para encontrar uma ficha. Confere tarefa, sintomas e demais critérios em trechos do relato. Negações, incertezas e menções familiares reconhecidas impedem a confirmação. Para TENS, a dor em repouso deixa pendente a relação entre dor e atividade.

Os critérios usam vocabulário em português. Perguntas não confirmam critérios, e negações comuns em espanhol e inglês também bloqueiam a correspondência. A leitura preserva itens de lista e une linhas indentadas de continuação.

A ficha e a lista de avaliações mostram autor e data de cada edição registrada. A sessão mantém a autoria da criação, pois é imutável pela API.

[RelatorioPaciente](../../frontend/src/features/pacientes/RelatorioPaciente.tsx) oferece seleção de seções e sessões, com impressão pelo navegador. A ficha confere o responsável informado pela API e os endpoints de paciente, avaliação e sessão conferem a posse no [PacienteService](../../backend/src/main/java/br/unibh/fisiotech/paciente/service/PacienteService.java).
