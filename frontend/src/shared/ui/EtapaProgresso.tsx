/** "Etapa 1 de 2 · Seus dados" com barras de progresso. O texto já diz tudo; as barras são decorativas. */
export function EtapaProgresso({ atual, total, titulo }: { atual: number; total: number; titulo: string }) {
  return (
    <div className="tf-etapas">
      <p className="tf-etapas__rotulo">
        Etapa {atual} de {total} · {titulo}
      </p>
      <div className="tf-etapas__barras" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < atual ? 'tf-etapas__barra tf-etapas__barra--feita' : 'tf-etapas__barra'} />
        ))}
      </div>
    </div>
  )
}
