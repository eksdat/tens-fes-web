# Fisiotech

Plataforma web educacional e clínica de eletroestimulação (TENS, NMES, FES).

| Pasta | Conteúdo | Documentação |
|---|---|---|
| `frontend/` | React 19 + TypeScript + Vite | [frontend/README.md](frontend/README.md) |
| `backend/` | Java 25 + Spring Boot 4 + PostgreSQL (Supabase) | [backend/README.md](backend/README.md) |

## O que o sistema faz hoje

| Área | Quem usa | Estado |
|---|---|---|
| Cadastro, login (e-mail ou Google), MFA, termos de uso | todos | Pronto. MFA obrigatório para profissional |
| Conteúdo técnico de TENS e FES (página padrão em 5 blocos) | todos | Pronto; textos em revisão docente, por isso as páginas ficam fechadas |
| Dicionário de parâmetros e lista de controles do aparelho | todos | Pronto |
| Atlas de eletrodos (5 pranchas) | todos | Pronto, dados no frontend |
| Simulador (modo explorar) com osciloscópio ao vivo e modos com forma própria | todos | Pronto, faixas vindas da API |
| Pacientes: cadastro, busca, ordenação, exclusão lógica | profissional | Pronto |
| Avaliação inicial e registro de sessão com checklist antes, durante e depois | profissional | Pronto |
| Casos do simulador, fluxo editorial, assistente de IA | — | Não iniciado |

Só dados fictícios até as políticas LGPD de [SEGURANCA.md](SEGURANCA.md) estarem aprovadas.

Produção: frontend no Firebase Hosting, API no Render (Docker) e banco no Supabase. Guia completo em [DEPLOY.md](DEPLOY.md).

Cada README explica stack, como rodar, arquitetura, UML, regras de acesso, testes e o fluxo de branches (`feature/*` → `homologacao` → `main`).

Política de segurança (banco, Supabase Auth, backend, frontend, IA, LGPD): [SEGURANCA.md](SEGURANCA.md). Todo PR que mexe em autenticação, autorização, paciente ou upload passa por ela.
