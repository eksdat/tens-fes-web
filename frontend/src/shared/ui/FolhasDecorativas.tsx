/** Motivo da marca: folhas de cantos opostos arredondados. Puramente decorativo. */
export function FolhasDecorativas({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 288 288" preserveAspectRatio="xMaxYMin slice" aria-hidden="true" focusable="false">
      <path className="tf-leaf-brand" d="M0 0H96A96 96 0 0 1 192 96V192H96A96 96 0 0 1 0 96Z" />
      <path className="tf-leaf-accent" d="M192 48A48 48 0 0 1 240 0H288V48A48 48 0 0 1 240 96H192Z" />
      <path className="tf-leaf-tint" d="M192 96H240A48 48 0 0 1 288 144V192H240A48 48 0 0 1 192 144Z" />
      <path className="tf-leaf-tint" d="M0 240A48 48 0 0 1 48 192H96V240A48 48 0 0 1 48 288H0Z" />
      <path className="tf-leaf-deep" d="M96 192H144A48 48 0 0 1 192 240V288H144A48 48 0 0 1 96 240Z" />
      <path className="tf-leaf-brand" d="M192 240A48 48 0 0 1 240 192H288V240A48 48 0 0 1 240 288H192Z" />
    </svg>
  )
}
