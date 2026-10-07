import { Link } from 'react-router'
import { DocumentoLegal, type SecaoLegal } from './DocumentoLegal'

const SECOES: SecaoLegal[] = [
  {
    titulo: '1. Dados que coletamos',
    paragrafos: [
      'No cadastro: nome, e-mail e senha (a senha fica protegida pelo provedor de autenticação; nós não a vemos).',
      'Do seu perfil: estudante informa instituição e período; profissional informa categoria, número de registro e UF do registro.',
      'Durante o uso: dados técnicos de acesso, como data e hora de entrada.',
    ],
  },
  {
    titulo: '2. Para que usamos',
    paragrafos: [
      'Criar e proteger sua conta, liberar os recursos do seu perfil e confirmar seu e-mail.',
      'Não vendemos seus dados nem os usamos para publicidade.',
    ],
  },
  {
    titulo: '3. Base legal (LGPD)',
    paragrafos: [
      'Tratamos os dados para executar o serviço que você pediu ao criar a conta e para cumprir obrigações de segurança. O aceite deste documento no cadastro registra que você leu esta política.',
    ],
  },
  {
    titulo: '4. Com quem compartilhamos',
    paragrafos: [
      'Apenas com os provedores que operam a plataforma: autenticação e banco de dados, hospedagem do servidor e hospedagem do site. Eles tratam os dados só para prestar esse serviço.',
    ],
  },
  {
    titulo: '5. Por quanto tempo guardamos',
    paragrafos: ['Enquanto a conta existir. Ao excluir a conta, os dados pessoais são apagados, salvo o que a lei exigir guardar.'],
  },
  {
    titulo: '6. Seus direitos',
    paragrafos: [
      'Você pode pedir acesso, correção, exclusão e portabilidade dos seus dados, e retirar o consentimento, nos termos da LGPD (Lei 13.709/2018).',
      'Os pedidos vão para o e-mail de contato da equipe do projeto, informado na plataforma.',
    ],
  },
  {
    titulo: '7. Segurança',
    paragrafos: [
      'Conexão criptografada, política de senha forte e acesso aos dados somente pela API, com controle por perfil. Nenhum sistema é totalmente imune; avisaremos em caso de incidente relevante.',
    ],
  },
]

export function PoliticaPrivacidadePage() {
  return (
    <DocumentoLegal
      titulo="Política de privacidade"
      secoes={SECOES}
      outro={
        <>
          Veja também os <Link to="/termos">Termos de uso</Link>.
        </>
      }
    />
  )
}
