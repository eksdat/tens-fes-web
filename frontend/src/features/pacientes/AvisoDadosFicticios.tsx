import { Alerta } from '../../shared/ui/Alerta'

/** Texto do card "Cadastrar e listar pacientes"; vale até a LGPD estar resolvida (SEGURANCA.md, seção 9). */
export function AvisoDadosFicticios() {
  return <Alerta intencao="atencao" titulo="Ambiente acadêmico: use apenas dados fictícios." />
}
