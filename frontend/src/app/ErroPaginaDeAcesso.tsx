import { AuthLayout } from '../shared/ui/AuthLayout'
import { Botao } from '../shared/ui/Botao'

export function ErroPaginaDeAcesso() {
  return (
    <AuthLayout kicker="Acesso" titulo="Fisiotech" texto="Acesse sua conta para continuar." voltarPara="/login">
      <div className="tf-pilha">
        <h1 className="tf-titulo">Não foi possível abrir esta página</h1>
        <p className="tf-sub">Recarregue para tentar novamente.</p>
        <div className="tf-acoes">
          <Botao onClick={() => window.location.reload()}>Recarregar página</Botao>
        </div>
      </div>
    </AuthLayout>
  )
}
