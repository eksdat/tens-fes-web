import axios, { type AxiosError } from 'axios'
import { supabase } from './supabase'

const urlPrincipal = import.meta.env.VITE_API_URL?.replace(/\/+$/, '')
const urlReserva = import.meta.env.VITE_API_FALLBACK_URL?.replace(/\/+$/, '')
const apiPrincipal = `${urlPrincipal}/api/v1`
const apiReserva = urlReserva && urlReserva !== urlPrincipal ? `${urlReserva}/api/v1` : undefined
const intervaloReserva = 30_000
let principalVerificada = false
let usarReservaAte = 0
let verificacao: Promise<void> | undefined

export const api = axios.create({ baseURL: apiPrincipal })

function apiIndisponivel(erro: AxiosError) {
  return erro.code === 'ERR_NETWORK' || erro.code === 'ECONNABORTED' ||
    erro.code === 'ETIMEDOUT' || [502, 503, 504].includes(erro.response?.status ?? 0)
}

function ativarReserva() {
  principalVerificada = false
  usarReservaAte = Date.now() + intervaloReserva
}

async function verificarPrincipal() {
  if (principalVerificada || Date.now() < usarReservaAte) return

  verificacao ??= axios.get(`${urlPrincipal}/actuator/health`, { timeout: 5_000 })
    .then(() => { principalVerificada = true })
    .catch((erro: unknown) => {
      if (axios.isAxiosError(erro) && apiIndisponivel(erro)) ativarReserva()
      else principalVerificada = true
    })
    .finally(() => { verificacao = undefined })
  await verificacao
}

api.interceptors.request.use(async (config) => {
  if (apiReserva && config.baseURL === apiPrincipal) {
    await verificarPrincipal()
    if (Date.now() < usarReservaAte) config.baseURL = apiReserva
    if (config.method === 'get' && !config.timeout) config.timeout = 15_000
  }
  const { data } = await supabase.auth.getSession()
  if (data.session) config.headers.Authorization = `Bearer ${data.session.access_token}`
  return config
})

let encerramento: Promise<unknown> | undefined
let sessaoExpirada = false

export function houveExpiracaoDaSessao() {
  return sessaoExpirada
}

export function limparAvisoDeSessao() {
  sessaoExpirada = false
}

api.interceptors.response.use(undefined, async (erro) => {
  if (apiReserva && axios.isAxiosError(erro) && erro.config?.baseURL === apiPrincipal && apiIndisponivel(erro)) {
    ativarReserva()
    if (erro.config.method === 'get') return api.request({ ...erro.config, baseURL: apiReserva })
  }
  if (axios.isAxiosError(erro) && erro.response?.status === 401 && erro.config?.headers.Authorization) {
    const { data } = await supabase.auth.getSession()
    if (data.session && erro.config.headers.Authorization === 'Bearer ' + data.session.access_token) {
      sessaoExpirada = true
      encerramento ??= supabase.auth.signOut({ scope: 'local' }).finally(() => {
        encerramento = undefined
      })
      await encerramento
    }
  }
  throw erro
})
