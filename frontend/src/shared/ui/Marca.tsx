import { Link } from 'react-router'

/** Folha de cantos opostos arredondados com uma linha de pulso, seguida do nome. */
export function Marca({ para = '/' }: { para?: string }) {
  return (
    <Link className="tf-brand" to={para} aria-label="Fisiotech, página inicial">
      <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <path className="tf-brand__leaf" d="M4 20A16 16 0 0 1 20 4H36V20A16 16 0 0 1 20 36H4Z" />
        <polyline className="tf-brand__pulse" points="9,21 15,21 18.5,12 22.5,29 26,21 31,21" />
      </svg>
      <span aria-hidden="true">FISIOTECH</span>
    </Link>
  )
}
