# Deploy

Único ambiente: **produção**. A branch `homologacao` é etapa de revisão no git, sem ambiente publicado.

```mermaid
flowchart LR
    U[Navegador] --> F[Firebase Hosting<br/>frontend estático]
    F -- HTTPS + JWT --> R[Render<br/>API Spring Boot em Docker]
    R -- JDBC --> S[(Supabase<br/>PostgreSQL)]
    F -- supabase-js: login --> A[Supabase Auth]
    C[cron-job.org] -- ping a cada 14 min --> R
```

| Peça | Serviço | Plano | Região | Cartão |
|---|---|---|---|---|
| Frontend | Firebase Hosting | Spark (grátis) | global (CDN) | não |
| Backend | Render, web service Docker | Free (0,1 CPU, 512 MB) | Oregon (US West) | não |
| Banco e login | Supabase | Free | `us-east-1` | não |
| Ping | cron-job.org | grátis | — | não |

| Endereço | Valor |
|---|---|
| Site | `https://fisiotech-3b4ad.web.app` (também `https://fisiotech-3b4ad.firebaseapp.com`) |
| API | `https://fisiotech-8a3v.onrender.com` |
| Projeto Firebase | `fisiotech-3b4ad` (`frontend/.firebaserc`) |

**Região:** Render em Oregon e Supabase em Virgínia. Cada consulta ao banco leva cerca de 70 ms a mais. A região de um serviço do Render não muda depois de criado; aceito enquanto só houver dados fictícios.

---

## 1. Backend no Render

O serviço usa `backend/Dockerfile` (Java 25, JVM limitada para 512 MB). `render.yaml` na raiz descreve o mesmo serviço para um Blueprint.

| Campo | Valor |
|---|---|
| Language | Docker |
| Branch | `main` |
| Root Directory | `backend` |
| Instance Type | Free |
| Health Check Path | `/actuator/health/liveness` (não toca no banco) |
| Auto-Deploy | After CI Checks Pass |
| Build/Start Command | vazios (vale o `Dockerfile`) |

### Variáveis de ambiente (painel do Render; nunca no repositório)

| Variável | Valor |
|---|---|
| `DB_URL` | JDBC do *Session pooler* do Supabase, com `?sslmode=require` |
| `DB_USERNAME` | `postgres.<project-ref>` |
| `DB_PASSWORD` | senha do banco |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `CORS_ALLOWED_ORIGINS` | origens do frontend, separadas por vírgula (seção 3) |
| `SWAGGER_ENABLED` | **não definir** em produção (Swagger desligado) |

### Comportamento do plano grátis

- Dorme após 15 min sem requisição. Com 0,1 CPU, a API leva **cerca de 3 min** para voltar. O mesmo vale depois de cada deploy.
- 750 horas por mês por workspace. Um serviço ligado 24 h gasta cerca de 744; dormindo à noite, cerca de 465.
- Um ping mantém a API acordada (seção 2).

## 2. Ping no cron-job.org

| Campo | Valor |
|---|---|
| URL | `https://<serviço>.onrender.com/actuator/health` (consulta o banco, o que também evita a pausa do Supabase grátis) |
| Método | GET |
| Fuso | America/Sao_Paulo |
| Agenda (crontab) | `*/14 7-21 * * *` (a cada 14 min, das 7h00 às 21h56) |
| Notificação de falha | só após 3 falhas seguidas |

Intervalo de 14 min, não 15: o Render dorme aos 15 min. Das 22h às 7h a API dorme; o ping das 7h00 acorda, e ela fica pronta por volta das 7h03. Esse primeiro ping costuma dar timeout, e isso é esperado.

## 3. Frontend no Firebase Hosting

`frontend/firebase.json` publica `frontend/dist`, devolve `index.html` para toda rota (SPA) e define os cabeçalhos de segurança (CSP, HSTS, `nosniff`). O `predeploy` roda `npm run build`. `frontend/.firebaserc` (no repositório) liga a pasta ao projeto. Todos os comandos `firebase` rodam **dentro de `frontend/`**.

**Cache:** o HTML (qualquer rota, inclusive `/` e `/login`) sai com `no-cache`; `/assets/**` sai `immutable` por 1 ano (o nome do arquivo tem hash). Sem isso, depois de um deploy o navegador pode manter um `index.html` antigo apontando para arquivos que não existem mais, e o usuário vê tela branca.

### Publicar (quem já tem acesso ao projeto)

1. Ter acesso: no console do Firebase › *Configurações do projeto* › *Usuários e permissões*, papel **Editor** para a conta de quem publica.
2. Instalar a CLI e entrar (uma vez por máquina): `npm install -g firebase-tools` e `firebase login`. Responder "No" à telemetria e ao Gemini.
3. Criar `frontend/.env.production.local` (ignorado pelo git, nunca no commit), copiando o `frontend/.env` e trocando só a API:
   ```powershell
   (Get-Content .env) -replace '^VITE_API_URL=.*','VITE_API_URL=https://<serviço>.onrender.com' | Set-Content .env.production.local
   ```
   O arquivo fica com `VITE_API_URL`, `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Em `frontend/`: `firebase deploy --only hosting`. No fim, a CLI mostra o *Hosting URL*.

### Como o projeto foi criado (histórico)

1. Console do Firebase › projeto › **Hosting** › **Vamos começar** › *Próxima* até o fim › **Continuar para o console**. Cria o site `<id-do-projeto>.web.app`. Não instalar o SDK do Firebase nem copiar o `firebaseConfig`: o login é do Supabase.
2. Em `frontend/`: `firebase use --add`, escolher o projeto e o alias `default`. Gera o `.firebaserc` (só o ID do projeto, não é segredo).

### Depois do primeiro deploy (feito em 2026-10-03)

| Onde | O quê |
|---|---|
| Render › Environment | `CORS_ALLOWED_ORIGINS` = `https://fisiotech-3b4ad.web.app,https://fisiotech-3b4ad.firebaseapp.com` (o Render reinicia) |
| `frontend/firebase.json` | se a URL do Render mudar, ajustar o `connect-src` da CSP |
| Supabase › Authentication › URL Configuration | **Site URL** = `https://fisiotech-3b4ad.web.app`; **Redirect URLs** = `http://localhost:5173/**`, `https://fisiotech-3b4ad.web.app/**`, `https://fisiotech-3b4ad.firebaseapp.com/**`. Nunca `*` |
| Google Cloud › OAuth › Origens JavaScript | `http://localhost:5173`, `https://fisiotech-3b4ad.web.app`. A URI de redirecionamento não muda (callback do Supabase) |

### Armadilhas

| Sintoma | Causa | Correção |
|---|---|---|
| `firebase use must be run from a Firebase project directory` | comando rodado fora de `frontend/`, onde está o `firebase.json` | `cd frontend` |
| O `firebase.json` perdeu CSP, cabeçalhos, `predeploy` e cache | o `firebase init` regrava o arquivo (e o assistente do console sugere rodá-lo) | `git restore frontend/firebase.json`. **Não rodar `firebase init` de novo**: o projeto já está configurado |
| `.firebaserc` com dois projetos ou alias repetido | `firebase init` e `firebase use --add` acrescentam alias | deixar só `"default"` com o ID do projeto |
| Tela branca logo depois de um deploy | HTML em cache apontando para arquivos antigos | já tratado: HTML `no-cache` |
| `403` em chamada à API a partir do site | URL do site ausente em `CORS_ALLOWED_ORIGINS` | acrescentar no Render |
| Login por e-mail ou Google não volta ao site | URL ausente nas Redirect URLs do Supabase | acrescentar na tabela acima |

### CSP: quando mudar

A política é estrita (`script-src 'self'`, sem inline). Mudanças esperadas:

- **CAPTCHA (Cloudflare Turnstile):** acrescentar `https://challenges.cloudflare.com` em `script-src` e criar `frame-src` para o mesmo endereço.
- **Biblioteca de UI que injete `<style>`** (Radix, por exemplo): se o console do navegador acusar bloqueio, ajustar `style-src`.
## 4. Conferência depois do deploy

```
GET  <API>/actuator/health                                   200
GET  <API>/api/v1/usuarios/me                                401 (sem token)
GET  <API>/v3/api-docs                                       404 (Swagger desligado)
GET  <SITE>/qualquer/rota                                     200 (SPA)
GET  <SITE>/  (cabeçalho Cache-Control)                       no-cache
OPTIONS <API>/api/v1/usuarios/me, Origin: <SITE>              200 (CORS)
OPTIONS <API>/api/v1/usuarios/me, Origin: site desconhecido   403
```

`<API>` e `<SITE>` são os endereços da tabela do início. No navegador, em `<SITE>`: o console não deve mostrar erro de CORS nem de CSP.

## 5. Pendências de deploy

| Item | Observação |
|---|---|
| Domínio próprio | Melhora entrega do e-mail (DKIM, SPF, DMARC) e o endereço do site |
| Deploy automático do frontend | Hoje manual (`firebase deploy`). Candidato a GitHub Actions |
| Região do banco | Antes de dado real: Supabase em `sa-east-1` (SEGURANCA.md, seção 9) |
| Tempo de subida (3 min) | Pode cair com cache de classes da JVM (AppCDS), em card próprio |
