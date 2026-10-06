import { Link } from 'react-router'
import { DocumentoLegal, type SecaoLegal } from './DocumentoLegal'

const SECOES: SecaoLegal[] = [
  {
    titulo: '1. O que é o Fisiotech',
    paragrafos: [
      'O Fisiotech é uma plataforma educativa sobre TENS e FES (eletroestimulação), com simuladores e registros de prática para estudantes e profissionais de fisioterapia e terapia ocupacional.',
      'O conteúdo apoia o estudo. Ele não substitui avaliação clínica, protocolo institucional nem decisão do profissional responsável.',
    ],
  },
  {
    titulo: '2. Quem pode usar',
    paragrafos: [
      'Estudantes e profissionais da área da saúde. Você informa o perfil no cadastro e responde pela veracidade dos dados, inclusive instituição, período e registro profissional.',
      'Cada pessoa tem uma conta. Não compartilhe sua senha.',
    ],
  },
  {
    titulo: '3. Dados de pacientes',
    paragrafos: [
      'Nesta fase a plataforma é um ambiente de ensino. Use somente dados fictícios ou anonimizados. Não registre nome, documento, contato ou imagem de pessoas reais.',
    ],
  },
  {
    titulo: '4. Uso adequado',
    paragrafos: [
      'Não tente acessar contas ou dados de outras pessoas, burlar controles de segurança, sobrecarregar o serviço ou usar a plataforma para fim ilícito.',
      'Podemos suspender contas que descumprirem estes termos.',
    ],
  },
  {
    titulo: '5. Disponibilidade',
    paragrafos: [
      'Mantemos o serviço com esforço razoável, sem garantia de funcionamento contínuo. A primeira resposta após um período sem uso pode demorar.',
    ],
  },
  {
    titulo: '6. Mudanças e contato',
    paragrafos: [
      'Podemos atualizar estes termos. Mudanças relevantes serão comunicadas por e-mail ou na plataforma.',
      'Dúvidas e pedidos: pelo e-mail de contato da equipe do projeto, informado na plataforma.',
    ],
  },
]

export function TermosDeUsoPage() {
  return (
    <DocumentoLegal
      titulo="Termos de uso"
      secoes={SECOES}
      outro={
        <>
          Veja também a <Link to="/privacidade">Política de privacidade</Link>.
        </>
      }
    />
  )
}
