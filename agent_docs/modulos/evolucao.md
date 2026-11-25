# Evolução e relatório

Na ficha do paciente, [SessoesDoPaciente](../../frontend/src/features/sessao/SessoesDoPaciente.tsx) lista sessões com data, autor e modalidade. [Evolucao](../../frontend/src/features/sessao/Evolucao.tsx) mostra barras antes/depois por sessão e tabela com tarefa, momento e contexto, seguindo a seção 19 do guia técnico.

A sessão aceita dor de 0 a 10. Se houver valor antes ou depois, tarefa e momento são obrigatórios. O campo vazio permanece nulo.

A ficha e a lista de avaliações mostram autor e data de cada edição registrada. A sessão mantém a autoria da criação, pois é imutável pela API.

[RelatorioPaciente](../../frontend/src/features/pacientes/RelatorioPaciente.tsx) oferece seleção de seções e sessões, com impressão pelo navegador. A ficha confere o responsável informado pela API e os endpoints de paciente, avaliação e sessão conferem a posse no [PacienteService](../../backend/src/main/java/br/unibh/fisiotech/paciente/service/PacienteService.java).
