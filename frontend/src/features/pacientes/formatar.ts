/** "1980-05-10" → "10/05/1980" sem passar por Date: evita o dia anterior por causa do fuso. */
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}
