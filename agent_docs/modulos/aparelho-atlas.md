# Aparelho e atlas de eletrodos

O painel do Neurodyn usa WebGL com teste de profundidade. A lista de controles e o painel 2D continuam disponíveis quando o navegador não oferece WebGL. A lista preserva as descrições, valores e estado da simulação. [Visor](../../frontend/src/features/aparelho/VisorAparelho.tsx) · [Geometria](../../frontend/src/features/aparelho/cenaAparelho.ts)

O atlas usa uma imagem WebP gerada de frente e de costas. A seleção abre a aproximação com eletrodos desenhados sobre a imagem. As coordenadas fotográficas são ilustrativas. A prancha anatômica original e o texto da montagem acompanham cada região. [Atlas](../../frontend/src/features/atlas/AtlasEletrodos.tsx) · [Coordenadas](../../frontend/src/features/atlas/posicoesFotograficas.ts)
