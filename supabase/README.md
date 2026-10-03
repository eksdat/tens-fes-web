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
