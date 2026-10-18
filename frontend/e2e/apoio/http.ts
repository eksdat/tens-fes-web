import type { Route } from '@playwright/test'

/** A tela roda em localhost e chama outro endereço: sem estes cabeçalhos o navegador barra a resposta (CORS). */
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'access-control-allow-headers': '*',
  'access-control-expose-headers': '*',
}

export async function responder(route: Route, status: number, corpo?: unknown) {
  if (corpo === undefined) {
    await route.fulfill({ status, headers: CORS })
    return
  }
  await route.fulfill({ status, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify(corpo) })
}

/** Pergunta que o navegador faz antes de mandar Authorization para outro endereço. */
export async function liberarPreflight(route: Route) {
  await route.fulfill({ status: 204, headers: CORS })
}

/** Corpo JSON do pedido (ou objeto vazio). */
export function lerCorpo<T = Record<string, unknown>>(route: Route): T {
  const texto = route.request().postData()
  return (texto ? JSON.parse(texto) : {}) as T
}
