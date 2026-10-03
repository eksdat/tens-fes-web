import axios from 'axios'
import { limparSessaoSalva, tokenSalvo } from '../auth/sessaoStorage'

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
})

api.interceptors.request.use((config) => {
  const token = tokenSalvo()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(undefined, (erro) => {
  if (axios.isAxiosError(erro) && erro.response?.status === 401) {
    limparSessaoSalva()
    window.location.assign('/login')
  }
  return Promise.reject(erro)
})
