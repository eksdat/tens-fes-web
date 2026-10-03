# Fisiotech — Frontend (Web)

SPA da plataforma educacional e clínica de eletroestimulação **Fisiotech** (TENS, NMES e FES). Este repositório tem duas pastas:

- `frontend/` (este documento): React 19 + TypeScript + Vite.
- `backend/`: API em Java 25 + Spring Boot. Veja `../backend/README.md`.

O frontend **nunca** fala direto com o banco. Todo dado passa pela API do backend (`/api/v1/**`). As regras de acesso valem no backend; aqui elas só escondem a interface.

Documentos de origem (fora deste repositório, pasta `docs/` do projeto): `Prototipo_TENS_FES_Revisado.md`, `Guia_Tecnico_Implementacao_TENS_FES.md`, `uml_e_arquitetura_do_sistema_front_end_back_end.md` e `trello_cards.md`.

---

## Sumário

1. [Stack](#1-stack)
2. [Pré-requisitos](#2-pré-requisitos)
3. [Como rodar localmente](#3-como-rodar-localmente)
4. [Variáveis de ambiente](#4-variáveis-de-ambiente)
5. [Comandos](#5-comandos)
6. [Arquitetura](#6-arquitetura)
7. [Estrutura de pastas](#7-estrutura-de-pastas)
8. [Autenticação no frontend](#8-autenticação-no-frontend)
9. [Perfis e regras de acesso](#9-perfis-e-regras-de-acesso)
10. [Mapa de telas](#10-mapa-de-telas)
11. [UML — domínio](#11-uml--domínio)
12. [UML — sequência: registrar sessão](#12-uml--sequência-registrar-sessão)
13. [Acessibilidade](#13-acessibilidade)
14. [Convenções de código](#14-convenções-de-código)
15. [Testes](#15-testes)
16. [Branches, commits e Pull Requests](#16-branches-commits-e-pull-requests)
17. [Deploy](#17-deploy)
18. [Estado atual e pendências](#18-estado-atual-e-pendências)

---

## 1. Stack

| Camada | Tecnologia | Motivo |
|---|---|---|
| UI | React 19 + TypeScript 6 | Tipagem forte |
| Build / dev server | Vite 8 | Rápido, HMR |
| Rotas | React Router 7 (`react-router`) | Rotas protegidas por perfil |
| Dados remotos | TanStack Query + axios | Cache, loading e erro sem código repetido |
| Formulários | React Hook Form + Zod 4 | Validação declarativa; mensagens acessíveis |
| Componentes base | Radix UI (`radix-ui`) | Foco, teclado e ARIA corretos por padrão |
| Aparelho 3D | react-three-fiber *(a adicionar)* | Modelo 3D com lista textual equivalente |
| Tipos da API | `openapi-typescript` | Gerados do contrato do backend |
| Lint | oxlint com plugin `jsx-a11y` | Lint rápido + regras de acessibilidade |
| Testes | Vitest + Testing Library + jsdom; `vitest-axe`; Playwright *(a adicionar)* | Unitário, componente, a11y, e2e |
| Deploy | Firebase Hosting (Spark) | Guia em [DEPLOY.md](../DEPLOY.md) |

> A doc de arquitetura cita ESLint + `eslint-plugin-jsx-a11y`. O template atual do Vite traz **oxlint**, que tem o mesmo conjunto de regras `jsx-a11y`. Ficamos com o oxlint para não manter dois linters.

---

## 2. Pré-requisitos

| Ferramenta | Versão |
|---|---|
| Node.js | 24 LTS ou mais novo |
| npm | 11+ (vem com o Node) |
| Backend rodando | para telas que chamam a API (ver `../backend/README.md`) |

```powershell
node -v
npm -v
```

---

## 3. Como rodar localmente

```powershell
git clone git@github.com:eksdat/tens-fes-web.git
cd tens-fes-web
git switch homologacao
cd frontend

npm install
copy .env.example .env      # ajuste VITE_API_URL se o backend não estiver em :8080
npm run dev
```

Abra http://localhost:5173.

- Sem login, qualquer rota protegida redireciona para `/login`.
- O login chama `POST {VITE_API_URL}/api/v1/auth/login`. Esse endpoint ainda não existe no backend. Até lá, o login responde erro.
- O backend precisa liberar a origem `http://localhost:5173` em `CORS_ALLOWED_ORIGINS` (já é o padrão).

---

## 4. Variáveis de ambiente

Ficam em `.env` (local) e em `.env.production.local` (build de produção, ver [DEPLOY.md](../DEPLOY.md)). Os dois estão no `.gitignore`.

| Variável | Obrigatória | Exemplo | Uso |
|---|---|---|---|
| `VITE_API_URL` | sim | `http://localhost:8080` | URL base do backend, sem `/api/v1` |

Toda variável com prefixo `VITE_` vai para o bundle e **fica pública** no navegador. Nunca coloque segredo aqui. Não há chave do Supabase no frontend, e não deve haver.

---

## 5. Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento em `:5173` |
| `npm run build` | Checagem de tipos (`tsc -b`) + build em `dist/` |
| `npm run preview` | Serve o `dist/` para conferir o build |
| `npm run lint` | oxlint (inclui regras de acessibilidade) |
| `npm test` | Vitest, uma execução |
| `npx vitest` | Vitest em modo watch |
| `npm run api:types` | Gera `src/shared/api/schema.d.ts` a partir de `http://localhost:8080/v3/api-docs` (backend precisa estar rodando) |

---

## 6. Arquitetura

Visão do sistema inteiro:

```mermaid
flowchart LR
    U[Navegador<br/>computador ou celular] --> F[Frontend React<br/>Firebase Hosting]
    F -- HTTPS + JWT<br/>/api/v1/** --> B[Backend Spring Boot<br/>Render]
    B -- JDBC + SSL --> D[(PostgreSQL<br/>Supabase)]
    B --> L[Provedor de LLM]
```

Plataforma: uma versão web responsiva (computador e navegador do celular). Não há aplicativo nativo.

**Supabase:** usado só como banco pelo backend. O frontend não usa Supabase Auth nem `@supabase/supabase-js`. Motivo: a regra "profissional só vê o próprio paciente" fica num lugar só, o backend.

### Organização por feature

Cada feature tem suas páginas, componentes, hooks de dados e schemas juntos. O que é usado por várias features fica em `shared/`.

| Peça | Papel | Pode | Não pode |
|---|---|---|---|
| Página (container) | Busca dados por hook e orquestra componentes | Usar hooks de dados | — |
| Componente de apresentação | Recebe `props`, dispara callbacks | Ter estado de UI | Chamar HTTP |
| Hook de dados (`usePacientes`, `useCriarSessao`) | Envolve `useQuery`/`useMutation` | Chamar `api` | Renderizar |
| Cliente API (`shared/api/client.ts`) | Instância axios com JWT e tratamento de 401 | — | Ter regra de negócio |
| Schema Zod (`schemas.ts`) | Validação do formulário | — | — |
| Tipos | Gerados do OpenAPI | — | Ser escritos à mão |

```mermaid
flowchart TB
    Page[Página] --> Hook[Hook de dados<br/>TanStack Query]
    Page --> Comp[Componente de apresentação]
    Comp --> UI[shared/ui<br/>sobre Radix]
    Hook --> Client[shared/api/client.ts<br/>axios + JWT]
    Client --> API[(Backend /api/v1)]
    Client -.lê token.-> Storage[shared/auth/sessaoStorage.ts]
```

---

## 7. Estrutura de pastas

```text
frontend/
├── index.html                 # lang="pt-BR"
├── package.json
├── vite.config.ts             # plugin React + config do Vitest
├── .oxlintrc.json             # lint, com jsx-a11y
├── .env.example
├── public/                    # arquivos servidos como estão (favicon)
└── src/
    ├── main.tsx               # monta Providers + RouterProvider
    ├── index.css              # estilo global mínimo, foco visível
    ├── app/
    │   ├── providers.tsx      # QueryClientProvider + AuthProvider
    │   └── router.tsx         # todas as rotas; ProtectedRoute por perfil
    ├── shared/
    │   ├── api/
    │   │   ├── client.ts      # axios: baseURL, Bearer token, 401 → /login
    │   │   └── schema.d.ts    # GERADO por `npm run api:types` — não editar
    │   ├── auth/
    │   │   ├── sessaoStorage.ts   # tipos Perfil/Sessao; ler/salvar/limpar no localStorage
    │   │   ├── AuthContext.tsx    # AuthProvider: estado da sessão, entrar(), sair()
    │   │   ├── useAuth.ts         # hook de acesso ao contexto
    │   │   ├── ProtectedRoute.tsx # exige login e, opcionalmente, um perfil
    │   │   └── ProtectedRoute.test.tsx
    │   └── ui/                # Button, Field, Dialog, Toast sobre Radix (a criar)
    ├── features/
    │   ├── auth/              # LoginPage (+ Cadastro, EsqueciSenha, NovaSenha a criar)
    │   ├── inicio/            # InicioPage
    │   ├── perfil/            # a criar
    │   ├── modulos/           # TENS e FES, aba Segurança (a criar)
    │   ├── dicionario/        # a criar
    │   ├── aparelho/          # Aparelho3D + ListaControles (a criar)
    │   ├── atlas/             # a criar
    │   ├── simulador/         # a criar
    │   ├── conteudo/          # CriarConteudo, Revisao, Biblioteca (a criar)
    │   ├── casos/             # a criar
    │   └── pacientes/         # a criar, com o formato abaixo
    │       ├── api/           # usePacientes, useCriarSessao
    │       ├── pages/
    │       ├── components/
    │       └── schemas.ts     # Zod
    └── test/
        └── setup.ts           # jest-dom, cleanup e limpeza do localStorage
e2e/                           # Playwright (a criar)
```

Crie a pasta da feature quando a primeira tela dela for feita. Não deixe pasta vazia.

---

## 8. Autenticação no frontend

> **Em transição.** O código atual ainda usa a sessão própria (`localStorage` + `POST /auth/login`), que não existe no backend. O card "Login, autenticação e verificação de e-mail (telas)" troca tudo pelo Supabase Auth, como descrito abaixo.

Alvo:

1. O cliente `@supabase/supabase-js` usa só `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, e **só** em `supabase.auth.*`. Nunca `from()`, `rpc()`, `storage` ou `realtime`.
2. Cadastro: `signUp` guarda a etapa 2 em `options.data`; o Supabase envia o e-mail de confirmação.
3. O link abre `/auth/callback`. Se `GET /api/v1/usuarios/me` responder **404**, a tela envia a etapa 2 em `POST /api/v1/usuarios/me`.
4. `client.ts` envia `Authorization: Bearer <access_token>` da sessão do Supabase (renovada pelo SDK).
5. O perfil vem de `GET /api/v1/usuarios/me` (TanStack Query), nunca do token nem do `localStorage`.
6. Resposta **401**: encerra a sessão e leva ao login. **403**: perfil sem permissão (mensagem, sem deslogar). **404** em paciente: "não encontrado", nunca "sem permissão".

`ProtectedRoute` decide só a navegação, em 3 estados: sem sessão (login), logado sem cadastro completo (completar cadastro) e logado com perfil (rotas do perfil).

---
## 9. Perfis e regras de acesso

| Área | Estudante | Profissional |
|---|---|---|
| Conteúdos TENS/FES, biblioteca, atlas, aparelho | Consulta | Consulta |
| Simulador e casos fictícios | Acesso | Acesso |
| Criar materiais | Rascunho e envio | Contribuição para revisão |
| Pacientes / prontuário | **Sem acesso** | **Só os pacientes sob sua responsabilidade** |
| Casos para a IA | Envia caso fictício | Conteúdo revisado alimenta a base |

Regras que o frontend precisa respeitar:

- Esconder menus e rotas que o perfil não usa. Isso é conforto, não segurança.
- Paciente não é usuário: não existe tela de login de paciente.
- Registro profissional digitado **não** mostra selo de "verificado".
- Anexo: só PDF e imagem, até 10 MB. Validar antes do upload; o backend valida de novo.
- "Esqueci a senha": mesma mensagem exista ou não a conta.
- Até as políticas LGPD estarem definidas: **somente dados fictícios**.

---

## 10. Mapa de telas

| Rota | Perfil | Página | Observações |
|---|---|---|---|
| `/login`, `/cadastro` | público | `LoginPage`, `CadastroPage` | Cadastro em etapas: dados comuns, depois perfil |
| `/esqueci-senha`, `/nova-senha` | público | `EsqueciSenhaPage`, `NovaSenhaPage` | Mesma mensagem exista ou não a conta |
| `/` | ambos | `InicioPage` | Atalhos conforme o perfil |
| `/tens/*`, `/fes/*` | ambos | `ModuloPage` | Abas: visão geral, aparelho, eletrodos, parâmetros, segurança, casos |
| `/aparelho/:id` | ambos | `AparelhoPage` | Canvas 3D + `ListaControles` textual com as mesmas funções |
| `/atlas` | ambos | `AtlasPage` | Descrição alternativa em toda prancha |
| `/dicionario` | ambos | `DicionarioPage` | Três grupos de parâmetros; busca por nome; unidade lida por extenso |
| `/simulador` | ambos | `SimuladorPage` | Modos explorar e praticar; pulso com descrição textual |
| `/biblioteca` | ambos | `BibliotecaPage` | Cartões de referência com filtro por modalidade |
| `/criar` | ambos | `CriarConteudoPage` | Rascunho, depois envio para revisão |
| `/revisao` | profissional | `RevisaoPage` | Aprovar ou devolver materiais em revisão |
| `/casos` | estudante | `CasosPage` | Envio para a IA |
| `/pacientes/**` | profissional | `PacientesPage`, `PacienteDetalhePage`, `AvaliacaoPage`, `NovaSessaoPage`, `EvolucaoPage`, `RelatorioPage` | Gráfico de evolução com tabela equivalente |
| `/perfil` | ambos | `PerfilPage` | Troca de estudante para profissional |

Hoje existem só `/login` e `/`.

---

## 11. UML — domínio

O frontend consome estas entidades pela API, sempre como DTO. Nunca recria regra de negócio delas.

```mermaid
classDiagram
    class Usuario {
        +UUID id
        +String nome
        +Perfil perfil
        +boolean revisor
        +boolean ativo
        +String instituicao
        +Integer periodo
        +Categoria categoria
        +String registro
        +String uf
    }
    class Categoria {
        <<enumeration>>
        FISIOTERAPEUTA
        TERAPEUTA_OCUPACIONAL
        OUTRA
    }
    class Perfil {
        <<enumeration>>
        ESTUDANTE
        PROFISSIONAL
    }
    class Paciente {
        +Long id
        +String nome
        +String identificadorInterno
        +LocalDate dataNascimento
        +String contato
    }
    class Avaliacao {
        +Long id
        +String queixa
        +String historico
        +Triagem triagem
        +Integer dorEscala
        +String peleSensibilidade
        +String funcaoMotora
        +String objetivoMensuravel
        +String plano
    }
    class Sessao {
        +Long id
        +LocalDateTime dataHora
        +String objetivo
        +Modalidade modalidade
        +Integer duracaoRealMin
        +String resposta
        +String intercorrencias
        +String resultadoAntesDepois
        +String encerramento
    }
    class ParametroAplicado {
        +Integer canal
        +BigDecimal frequenciaHz
        +Integer larguraPulsoUs
        +BigDecimal amplitudeInicialMa
        +BigDecimal amplitudeFinalMa
        +String formaOnda
        +Temporizacao temporizacao
    }
    class EletrodoAplicado {
        +Integer canal
        +String tipo
        +String dimensoes
        +Lado lado
        +String marcosAnatomicos
    }
    class Modalidade {
        <<enumeration>>
        TENS
        NMES
        FES
    }
    class EstadoAchado {
        <<enumeration>>
        NAO_AVALIADO
        AUSENTE
        PRESENTE
    }
    class Aparelho {
        +Long id
        +String fabricante
        +String modelo
        +String versaoManual
    }
    class Controle {
        +Long id
        +String nome
        +String funcao
        +String unidade
        +String descricaoAcessivel
    }
    class PranchaAtlas {
        +Long id
        +Modalidade modalidade
        +String regiao
        +String vista
        +String alvos
        +String pares
        +String descricaoAlternativa
    }
    class Conteudo {
        +Long id
        +String titulo
        +Modalidade modalidade
        +String corpo
        +String referencias
        +Integer versao
        +EstadoEditorial estado
        +LocalDate dataRevisao
    }
    class EstadoEditorial {
        <<enumeration>>
        RASCUNHO
        EM_REVISAO
        APROVADO
        ARQUIVADO
    }
    class CasoClinico {
        +Long id
        +String titulo
        +String objetivo
        +String contexto
        +String proposta
        +String duvida
    }
    class RespostaIA {
        +Long id
        +String texto
        +List~String~ referencias
        +boolean evidenciaSuficiente
        +LocalDateTime geradaEm
    }
    class ParametroDicionario {
        +Long id
        +String nome
        +GrupoParametro grupo
        +String unidade
        +String unidadeExtenso
        +String oQueMuda
        +String exemplo
    }
    class GrupoParametro {
        <<enumeration>>
        AJUSTE_BASICO
        RECURSO_ESPECIFICO
        ESPECIFICACAO_ELETRICA
    }
    class CasoPratica {
        +Long id
        +String titulo
        +Modalidade modalidade
        +String cenario
        +String respostaEsperada
        +String modeloRetorno
    }
    class TentativaPratica {
        +Long id
        +String parametrosEscolhidos
        +String justificativa
        +LocalDateTime enviadaEm
    }
    class Referencia {
        +Long id
        +String codigo
        +String titulo
        +String autores
        +Modalidade modalidade
        +String comoAcessar
        +boolean licencaPermiteCopia
    }
    class Material {
        +Long id
        +String titulo
        +String corpo
        +EstadoEditorial estado
        +String motivoDevolucao
    }
    class Anexo {
        +Long id
        +String nomeArquivo
        +String tipo
        +Long tamanhoBytes
    }

    Usuario --> Perfil
    Usuario --> Categoria
    Usuario "1 responsavel" -- "*" Paciente
    Paciente "1" *-- "*" Avaliacao
    Paciente "1" *-- "*" Sessao
    Sessao "*" --> "1" Aparelho
    Sessao "1" *-- "*" ParametroAplicado
    Sessao "1" *-- "*" EletrodoAplicado
    Sessao "*" --> "0..1" PranchaAtlas : baseada em
    Sessao --> Modalidade
    Aparelho "1" *-- "*" Controle
    Conteudo --> EstadoEditorial
    Conteudo "*" --> "1" Usuario : autor
    Conteudo "*" --> "0..1" Usuario : revisor
    CasoClinico "*" --> "1" Usuario : estudante
    CasoClinico "1" *-- "*" RespostaIA
    RespostaIA "*" --> "*" Conteudo : cita
    ParametroDicionario --> GrupoParametro
    CasoPratica "1" -- "*" TentativaPratica
    TentativaPratica "*" --> "1" Usuario : estudante
    Material "*" --> "1" Usuario : autor
    Material "*" --> "0..1" Usuario : revisor
    Material --> EstadoEditorial
    Material "1" *-- "*" Anexo
    CasoClinico "1" *-- "*" Anexo
```

O que muda na tela por causa do modelo:

- Campos de triagem, pele e função usam `EstadoAchado`. O formulário oferece **"Não avaliado"** explícito. Campo vazio não significa ausência de risco.
- Campos de `ParametroAplicado` mostram a unidade ao lado do input (Hz, µs, mA) e a unidade por extenso para leitor de tela.
- `ParametroDicionario` (página `/dicionario`) ≠ `ParametroAplicado` (formulário de sessão).
- `CasoPratica` = os 4 casos do simulador. `CasoClinico` = caso enviado para a IA em `/casos`.
- `RespostaIA` exibe referências e data de revisão. Com `evidenciaSuficiente = false`, mostra o aviso padrão.

Fluxo editorial de material (telas `/criar` e `/revisao`):

```mermaid
stateDiagram-v2
    [*] --> RASCUNHO
    RASCUNHO --> EM_REVISAO : autor envia
    EM_REVISAO --> RASCUNHO : revisor devolve (motivoDevolucao)
    EM_REVISAO --> APROVADO : revisor aprova (revisor ≠ autor)
    APROVADO --> ARQUIVADO
    ARQUIVADO --> [*]
```

O botão "Aprovar" não aparece para o autor do material.

---

## 12. UML — sequência: registrar sessão

```mermaid
sequenceDiagram
    autonumber
    actor P as Profissional
    participant UI as React (NovaSessaoPage)
    participant Hook as useCriarSessao (TanStack Query)
    participant Api as axios + interceptor JWT
    participant Sec as Spring Security
    participant C as SessaoController
    participant S as SessaoService
    participant PS as PacienteService
    participant DB as PostgreSQL

    P->>UI: Preenche formulário e confirma revisão
    UI->>UI: Validação Zod (erros anunciados via aria-live)
    UI->>Hook: mutate(dados)
    Hook->>Api: POST /api/v1/pacientes/{id}/sessoes
    Api->>Sec: Authorization: Bearer JWT
    Sec->>C: Perfil PROFISSIONAL ok
    C->>C: @Valid SessaoRequest
    C->>S: criar(pacienteId, req, usuario)
    S->>PS: buscarDoResponsavel(pacienteId, usuario)
    alt não é o responsável
        PS-->>C: PacienteNaoEncontradoException
        C-->>UI: 404 ProblemDetail
    else é o responsável
        S->>DB: INSERT sessao (+ auditoria Envers)
        DB-->>S: Sessao salva
        S-->>C: SessaoResponse
        C-->>Hook: 201 Created
        Hook->>Hook: invalida cache ["sessoes", pacienteId]
        UI-->>P: Confirmação anunciada ao leitor de tela
    end
```

Padrão de chave do TanStack Query: `[recurso, ...ids]`. Ex.: `["pacientes"]`, `["sessoes", pacienteId]`. Toda mutation invalida a chave do recurso que mudou.

---

## 13. Acessibilidade

Meta: **WCAG 2.2 AA**. Testes manuais com NVDA, VoiceOver e TalkBack.

- Toda função do 3D existe também na lista textual (`ListaControles`). O 3D é complemento.
- Erro de formulário ligado ao campo por `aria-describedby`, com `aria-invalid`. Erro geral em `role="alert"`. Veja `src/features/auth/LoginPage.tsx`.
- Todo `input` tem `label` com `htmlFor`.
- Foco previsível ao abrir e fechar diálogos (Radix garante).
- Foco sempre visível (`:focus-visible` em `src/index.css`).
- Informação nunca depende só de cor. Gráfico tem tabela ou resumo textual.
- Imagem e prancha do atlas sempre com descrição alternativa.
- `oxlint` com `jsx-a11y` no lint; `vitest-axe` nos testes de componente.

---

## 14. Convenções de código

- Nomes em **português** do domínio (`entrar`, `sair`, `Sessao`, `usePacientes`). Termos de biblioteca ficam como são.
- Componente: `PascalCase.tsx`. Hook: `useAlgo.ts`. Teste ao lado do arquivo: `Algo.test.tsx`.
- Exportação nomeada. Sem `export default` (exceto config de ferramenta).
- Componente de apresentação não chama HTTP.
- Não escreva tipo de DTO à mão: use `schema.d.ts` gerado.
- Comentário só explica **por quê**. Nada de código comentado ou `TODO` sem dono.
- Solução mais simples para o problema de hoje. Sem abstração "para o futuro".

---

## 15. Testes

| Tipo | Ferramenta | Onde |
|---|---|---|
| Unitário / componente | Vitest + Testing Library + jsdom | `src/**/*.test.tsx` |
| Acessibilidade automática | `vitest-axe` | nos testes de componente |
| End-to-end | Playwright *(a adicionar)* | `e2e/` |

Regras:

- **TDD**: bug novo começa com teste que falha. Regra nova começa pelo teste.
- Nome descreve comportamento: `deveRedirecionarEstudanteQueTentaAbrirPacientes`.
- Teste o que o usuário vê (texto, papel, label), não detalhe interno.
- Sem dependência de ordem, relógio real ou rede. Chamadas HTTP mockadas.
- `src/test/setup.ts` limpa o DOM e o `localStorage` depois de cada teste.

Exemplo atual: `src/shared/auth/ProtectedRoute.test.tsx` (3 testes).

---

## 16. Branches, commits e Pull Requests

```mermaid
gitGraph
    commit id: "main estável"
    branch homologacao
    checkout homologacao
    branch feature/login
    checkout feature/login
    commit id: "feat: login"
    checkout homologacao
    merge feature/login id: "PR aprovado"
    checkout main
    merge homologacao id: "PR homologacao → main"
```

| Branch | Papel | Quem escreve |
|---|---|---|
| `main` | Produção. Sempre estável | Só por PR vindo de `homologacao` |
| `homologacao` | Integração e teste antes da produção | Só por PR vindo de `feature/*` ou `fix/*` |
| `feature/<descricao>` | Funcionalidade nova. Sai de `homologacao` | Autor |
| `fix/<descricao>` | Correção. Sai de `homologacao` | Autor |
| `hotfix/<descricao>` | Correção urgente em produção. Sai de `main`, volta para `main` **e** `homologacao` | Autor |

Fluxo:

1. `git switch homologacao && git pull`
2. `git switch -c feature/tela-login`
3. Commits pequenos. Rode `npm run lint`, `npm test` e `npm run build`.
4. Push e PR para `homologacao`.
5. **O outro dev revisa e aprova.** Ninguém aprova o próprio PR.
6. CI verde + aprovação: merge em `homologacao`.
7. Validado em homologação: PR `homologacao` → `main`, também com aprovação do outro dev.

Proibido: push direto em `main` ou `homologacao`, `push --force` nessas duas, merge com CI vermelho.

Commits: uma linha, imperativo, prefixo [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

```
feat: adiciona tela de login com validação acessível
fix: redireciona para login após 401
docs: explica variáveis de ambiente no README
test: cobre ProtectedRoute por perfil
chore: atualiza vite para 8.3
```

Sem linha de coautoria nem assinatura de ferramenta.

---

## 17. Deploy

Frontend no **Firebase Hosting** (plano Spark). Só existe o ambiente de produção; a branch `homologacao` é etapa de revisão no git.

- `firebase.json` (raiz): publica `frontend/dist`, devolve `index.html` para toda rota (SPA), define a CSP e os demais cabeçalhos de segurança e roda `npm run build` antes do deploy.
- Build de produção lê `frontend/.env.production.local` (API, Supabase). Nunca no commit.
- Deploy manual: `firebase deploy --only hosting`. Passo a passo e conferência em **[DEPLOY.md](../DEPLOY.md)**.
- CORS: o backend (Render) precisa listar a URL do site em `CORS_ALLOWED_ORIGINS`.
- CSP estrita (`script-src 'self'`): ao incluir o CAPTCHA (Turnstile) ou uma biblioteca que injete estilo, ajustar o `firebase.json`.
- CI de frontend (GitHub Actions): ainda não criado.

---
## 18. Estado atual e pendências

Pronto nesta base:

- Vite + React 19 + TypeScript; dependências da stack instaladas.
- Rotas com `ProtectedRoute` por perfil; `/login` e `/` funcionando.
- `AuthProvider` com sessão no `localStorage`.
- Cliente axios com Bearer token e redirecionamento no 401.
- `LoginPage` com React Hook Form + Zod e erros acessíveis.
- Vitest configurado; 3 testes passando. Lint e build ok.

Pendente:

- Troca da sessão própria pelo Supabase Auth (card de login, autenticação e verificação).
- Componentes `shared/ui` sobre Radix.
- Demais telas do mapa (seção 10).
- `vitest-axe` em uso nos testes (instalado, sem teste ainda).
- `openapi-typescript`: hoje roda por `npx` no script `api:types`, porque a versão 7.13 pede TypeScript 5 e o projeto usa 6. Instalar como dependência quando sair versão compatível.
- Playwright, react-three-fiber, workflow de CI e deploy automático no Firebase.
- Bundle passa de 500 kB: dividir rotas com `lazy()` quando houver mais telas.
