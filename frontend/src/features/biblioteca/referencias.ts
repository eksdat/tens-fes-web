import { R1, R2, R3, R4, R5 } from '../modulo/fontes'

const ABERTO = 'Leitura aberta'
const PUBLICO = 'Consulta pública'
const INSTITUCIONAL = 'Institucional ou aquisição'
const DIREITOS = 'Consulte a licença na fonte antes de reutilizar texto ou imagens.'

export const REFERENCIAS = [
  { ...R1, titulo: 'Fundamentos de TENS', tema: 'Fundamentos', tipo: 'Artigo', modalidades: ['TENS'], acesso: ABERTO, descricao: 'Definições, técnicas e parâmetros clássicos.', direitos: DIREITOS },
  { ...R2, titulo: 'Evidência de analgesia', tema: 'Evidências', tipo: 'Revisão sistemática', modalidades: ['TENS'], acesso: ABERTO, descricao: 'Resultados de estudos sobre dor e limites de interpretação.', direitos: DIREITOS },
  { ...R3, titulo: 'Estimulação neuromuscular', tema: 'Fundamentos', tipo: 'Revisão crítica', modalidades: ['NMES/FES'], acesso: ABERTO, descricao: 'Aplicações, terminologia e protocolos por condição.', direitos: DIREITOS },
  { ...R4, titulo: 'Segurança', tema: 'Segurança', tipo: 'Artigo', modalidades: ['TENS', 'NMES/FES'], acesso: ABERTO, descricao: 'Contraindicações e precauções por modalidade.', direitos: DIREITOS },
  { ...R5, titulo: 'FES na marcha', tema: 'Marcha', tipo: 'Informe técnico', modalidades: ['NMES/FES'], acesso: PUBLICO, descricao: 'Exemplo de sistema dedicado para pé caído.', direitos: DIREITOS },
  {
    codigo: 'R6', titulo: 'Diretrizes de acessibilidade', tema: 'Acessibilidade', tipo: 'Recomendação técnica',
    referencia: 'W3C. Web Content Accessibility Guidelines (WCAG) 2.2, 2023.',
    url: 'https://www.w3.org/TR/WCAG22/', modalidades: ['TENS', 'NMES/FES'], acesso: PUBLICO,
    descricao: 'Critérios de acessibilidade para conteúdo web.', direitos: DIREITOS,
  },
  {
    codigo: 'R7', titulo: 'Livro aberto de anatomia', tema: 'Anatomia', tipo: 'Livro',
    referencia: 'OPENSTAX. Anatomy and Physiology 2e, 2022.',
    url: 'https://openstax.org/details/books/anatomy-and-physiology-2e', modalidades: ['TENS', 'NMES/FES'], acesso: ABERTO,
    descricao: 'Apoio sobre tecido muscular, sistema nervoso e movimentos.', direitos: DIREITOS,
  },
  {
    codigo: 'R8', titulo: 'Livro de eletroterapia', tema: 'Fundamentos', tipo: 'Livro',
    referencia: 'ROBERTSON, V.; WARD, A.; LOW, J.; REED, A. Electrotherapy Explained: Principles and Practice. 4. ed. Elsevier, 2006.',
    url: 'https://shop.elsevier.com/books/electrotherapy-explained/robertson/978-0-7506-8843-7',
    modalidades: ['TENS', 'NMES/FES'], acesso: INSTITUCIONAL,
    descricao: 'Complemento de fundamentos. Consulta institucional ou aquisição.',
    direitos: 'Obra protegida. O link indica uma via de consulta. A reprodução depende de autorização.',
  },
].map((referencia) => ({ ...referencia, idioma: 'Inglês', conferidaEm: '2026-11-25' }))
