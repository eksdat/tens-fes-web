# Decisões

- A evolução usa duas séries na mesma escala para facilitar a comparação entre sessões. Valores ausentes e diferenças de tarefa, momento ou contexto interrompem a linha.
- O relatório usa a impressão nativa do navegador e os dados dos endpoints já protegidos por posse. A seleção fica em memória na ficha.
- O atlas usa vistas fotográficas fixas com zoom e mantém a prancha anatômica para consulta. O aparelho usa geometria 3D para explorar as faces e as conexões.

## Segunda instância da API

O deploy da Cloudflare reutiliza a imagem Docker do Render. O frontend escolhe a instância para que uma queda do Worker também permita usar o Render. Uma gravação que já saiu do navegador preserva o erro para evitar duplicidade. O Supabase compartilhado é uma dependência das duas instâncias. Veja [Deploy](../DEPLOY.md).
