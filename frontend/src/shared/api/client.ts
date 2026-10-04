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

// 401: a sessão não vale mais. Encerrar dispara onAuthStateChange e a rota protegida leva ao login.
api.interceptors.response.use(undefined, async (erro) => {
  if (axios.isAxiosError(erro) && erro.response?.status === 401) {
    await supabase.auth.signOut()
  }
  return Promise.reject(erro)
})
