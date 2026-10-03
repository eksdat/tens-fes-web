import { useAuth } from '../../shared/auth/useAuth'

export function InicioPage() {
  const { sessao, sair } = useAuth()
  return (
    <main>
      <h1>Olá, {sessao?.nome}</h1>
      <button type="button" onClick={sair}>
        Sair
      </button>
    </main>
  )
}
