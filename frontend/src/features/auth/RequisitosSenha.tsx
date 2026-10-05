const REQUISITOS = [
  { texto: 'Mínimo de 10 caracteres', vale: (s: string) => s.length >= 10 },
  { texto: 'Uma letra maiúscula', vale: (s: string) => /[A-Z]/.test(s) },
  { texto: 'Uma letra minúscula', vale: (s: string) => /[a-z]/.test(s) },
  { texto: 'Um número', vale: (s: string) => /\d/.test(s) },
  { texto: 'Um símbolo, como ! ou #', vale: (s: string) => /[^A-Za-z0-9]/.test(s) },
]

/** Checklist da política de senha (SEGURANCA.md, seção 3), atualizado a cada tecla. Estado vai em texto, não só em cor. */
export function RequisitosSenha({ senha }: { senha: string }) {
  const atendidos = REQUISITOS.filter(({ vale }) => vale(senha)).length

  return (
    <>
      <ul className="tf-requisitos" aria-label="Requisitos da senha">
        {REQUISITOS.map(({ texto, vale }) => {
          const ok = vale(senha)
          return (
            <li key={texto} className={ok ? 'tf-requisitos__ok' : undefined}>
              <span aria-hidden="true">{ok ? '✓' : '○'}</span> {texto}
              <span className="tf-sr-only">{ok ? ' (atendido)' : ' (pendente)'}</span>
            </li>
          )
        })}
      </ul>
      {/* Só muda quando um requisito passa a valer ou deixa de valer: o leitor de tela não fala a cada tecla. */}
      <output className="tf-sr-only">
        {atendidos} de {REQUISITOS.length} requisitos atendidos
      </output>
    </>
  )
}
