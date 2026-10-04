# Supabase — templates de e-mail

O Supabase Auth envia os e-mails de autenticação. Os templates vivem no painel; esta pasta guarda a versão oficial para revisão em PR.

| Arquivo | Painel: *Authentication › Emails › Templates* | Assunto |
|---|---|---|
| `templates/confirmar-cadastro.html` | Confirm signup | `Confirme seu cadastro no Fisiotech` |
| `templates/redefinir-senha.html` | Reset password | `Redefinição de senha do Fisiotech` |
| `templates/trocar-email.html` | Change email address | `Confirme seu novo e-mail no Fisiotech` |
| `templates/reautenticacao.html` | Reauthentication | `Seu código de verificação do Fisiotech` |
| `templates/aviso-senha-alterada.html` | Password changed (ligado) | `Sua senha do Fisiotech foi alterada` |
| `templates/aviso-email-alterado.html` | Email address changed (ligado) | `O e-mail da sua conta Fisiotech foi alterado` |
| `templates/aviso-mfa-adicionado.html` | MFA method added (ligado) | `Verificação em duas etapas ativada no Fisiotech` |
| `templates/aviso-mfa-removido.html` | MFA method removed (ligado) | `Verificação em duas etapas removida no Fisiotech` |
| `templates/aviso-login-vinculado.html` | Sign-in method linked (ligado) | `Novo método de login no Fisiotech` |

Sem template (recurso não usado): Invite user, Magic link or OTP, Phone number changed, Sign-in method removed.

## Como atualizar

1. Edite o HTML aqui e abra PR.
2. Depois do merge, copie o conteúdo para o template correspondente no painel e salve.

Variáveis: `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}` (só troca de e-mail), `{{ .OldEmail }}` (só aviso de e-mail alterado), `{{ .Token }}` (só reautenticação), `{{ .FactorType }}` (só avisos de MFA), `{{ .Provider }}` (só login vinculado). Variável fora do template certo sai vazia.

## Envio

SMTP próprio pela conta Gmail do projeto (senha de app), configurado em *Authentication › Emails › SMTP Settings*. Credenciais só no painel. Limite: 30 e-mails/hora em *Authentication › Rate Limits*.

## Supabase local

`config.toml` configura o Supabase local (`npx supabase start`, Docker) com a mesma política da nuvem: senha forte de 10 caracteres, confirmação por e-mail, TOTP e os templates desta pasta. Com o SMTP real ligado (padrão), os e-mails saem de verdade; sem ele, caem no Mailpit (http://127.0.0.1:54324). Mudou uma regra de Auth no painel? Repita no `config.toml`. Passo a passo em [backend/README.md](../backend/README.md).

### Login com Google no local

O `config.toml` liga o provedor Google lendo `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` de `supabase/.env`. Passos:

1. No Google Cloud › *APIs e serviços* › *Credenciais*, abra o ID do cliente OAuth e inclua em *URIs de redirecionamento autorizados*: `http://127.0.0.1:54321/auth/v1/callback` (o da nuvem, `https://<projeto>.supabase.co/auth/v1/callback`, continua lá).
2. Preencha as duas variáveis no `supabase/.env` (o mesmo cliente OAuth da nuvem serve).
3. `npx supabase stop` e `npx supabase start`.

Na nuvem, o provedor já está configurado no painel (*Authentication › Sign In / Providers › Google*). Contas com o mesmo e-mail verificado (senha e Google) viram uma só.

### E-mail real no local

O `config.toml` já liga o SMTP (`[auth.email.smtp]`), então os e-mails do Supabase local saem de verdade e não caem mais no Mailpit. Copie `supabase/.env.example` para `supabase/.env` e preencha (host, usuário, senha de app do Gmail, remetente). Sem o `.env` preenchido, o `npx supabase start` falha. O `.env` é ignorado pelo git. Para voltar ao Mailpit, ponha `enabled = false` no bloco SMTP.
