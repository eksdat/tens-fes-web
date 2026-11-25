import axios from 'axios'
import { supabase } from './supabase'

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
})

api.interceptors.request.use(async (config) => {
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
