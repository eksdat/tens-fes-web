# Aparelho e atlas de eletrodos

Os seletores de região ficam centralizados abaixo das fotos do atlas. No aparelho, as ações de vista e zoom e a lista de controles ficam centralizadas em relação ao visor.

TENS e FES têm uma aba **Simulador**. A aba abre na modalidade do módulo e a rota geral do simulador continua disponível. A interface distingue pulso individual (µs), sequência de pulsos (ms) e ciclo FES (s). No modelo didático recíproco, o canal 2 começa ao fim do estímulo do canal 1 e cada canal repousa pelo menos durante todo o estímulo do outro. O aviso, a tabela e o gráfico usam o repouso efetivo. [Cálculo](../../frontend/src/features/simulador/calculos.ts) · [Traçado](../../frontend/src/features/simulador/tracado.ts)

No FES, a janela do osciloscópio e a envoltória dos canais usam o mesmo relógio. A amplitude de cada pulso vem da etapa do ciclo no momento em que ele ocorreu. Os controles de execução ficam junto ao gráfico. Ao aplicar uma configuração da IA, o foco vai para o gráfico com a simulação pausada. [Osciloscópio](../../frontend/src/features/simulador/OsciloscopioAoVivo.tsx)

O painel do Neurodyn usa WebGL com teste de profundidade. A lista de controles e o painel 2D continuam disponíveis quando o navegador não oferece WebGL. A lista preserva as descrições, valores e estado da simulação. [Visor](../../frontend/src/features/aparelho/VisorAparelho.tsx) · [Geometria](../../frontend/src/features/aparelho/cenaAparelho.ts)

O atlas usa uma imagem WebP gerada de frente e de costas. A seleção abre a aproximação com eletrodos desenhados sobre a imagem. As coordenadas fotográficas são ilustrativas. A prancha anatômica original e o texto da montagem acompanham cada região. [Atlas](../../frontend/src/features/atlas/AtlasEletrodos.tsx) · [Coordenadas](../../frontend/src/features/atlas/posicoesFotograficas.ts)
