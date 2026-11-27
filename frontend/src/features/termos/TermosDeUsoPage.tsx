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
      'Só o profissional que cadastrou um paciente vê os dados dele. Paciente excluído some da lista na hora e é apagado de vez 90 dias depois.',
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
    titulo: '5. Recursos de inteligência artificial',
    paragrafos: [
      'A inteligência artificial gera feedback e sugestões de configuração para explorar o gráfico de TENS e FES. As saídas identificadas como geradas por IA podem conter erros. Confira a modalidade, o modo, os valores e as unidades antes de aplicá-los no simulador.',
      'Use as sugestões apenas em exercícios fictícios. Elas não são prescrições e não devem orientar atendimento ou ajustes em equipamentos reais.',
      'Ao solicitar uma avaliação ou configuração, o Fisiotech envia o texto do exercício a um provedor de IA. Use somente informações inventadas e deixe de fora dados pessoais, informações de pacientes e prontuários. Os anexos não são enviados ao provedor.',
    ],
  },
  {
    titulo: '6. Disponibilidade',
    paragrafos: [
      'Mantemos o serviço com esforço razoável, sem garantia de funcionamento contínuo. A primeira resposta após um período sem uso pode demorar.',
    ],
  },
  {
    titulo: '7. Mudanças e contato',
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
