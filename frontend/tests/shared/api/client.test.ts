import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

const principal = 'https://api-primaria.example'
const reserva = 'https://api-reserva.example'

vi.mock('../../../src/shared/api/supabase', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }), signOut: vi.fn() } },
}))

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('VITE_API_URL', principal)
  vi.stubEnv('VITE_API_FALLBACK_URL', reserva)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

const sucesso = (config: InternalAxiosRequestConfig) => ({
  data: null, status: 200, statusText: 'OK', headers: {}, config,
})

it('envia a primeira gravação somente à reserva se a verificação da principal falhar', async () => {
  const verificar = vi.spyOn(axios, 'get').mockRejectedValue(new AxiosError('Sem conexão', 'ERR_NETWORK'))
  const { api } = await import('../../../src/shared/api/client')
  api.defaults.adapter = vi.fn(async (config) => sucesso(config))

  await api.post('/pacientes', {})

  expect(verificar).toHaveBeenCalledWith(`${principal}/actuator/health`, { timeout: 5000 })
  expect(api.defaults.adapter).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ baseURL: `${reserva}/api/v1` }))
})

it('repete uma leitura na reserva quando a API principal perde a conexão', async () => {
  vi.spyOn(axios, 'get').mockResolvedValue({ status: 200 })
  const { api } = await import('../../../src/shared/api/client')
  const enviar = vi.fn(async (config: InternalAxiosRequestConfig) => sucesso(config))
  enviar.mockImplementationOnce(async (config) => { throw new AxiosError('Sem conexão', 'ERR_NETWORK', config) })
  api.defaults.adapter = enviar

  await api.get('/pacientes')

  expect(enviar.mock.calls.map(([config]) => config.baseURL)).toEqual([`${principal}/api/v1`, `${reserva}/api/v1`])
})

it('preserva a falha de uma gravação já enviada à API principal', async () => {
  vi.spyOn(axios, 'get').mockResolvedValue({ status: 200 })
  const { api } = await import('../../../src/shared/api/client')
  const enviar = vi.fn(async (config: InternalAxiosRequestConfig) => {
    throw new AxiosError('Sem conexão', 'ERR_NETWORK', config)
  })
  api.defaults.adapter = enviar

  await expect(api.post('/pacientes', {})).rejects.toMatchObject({ code: 'ERR_NETWORK' })

  expect(enviar).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ baseURL: `${principal}/api/v1` }))
})

it('volta à API principal quando ela responde após o intervalo da reserva', async () => {
  const relogio = vi.spyOn(Date, 'now').mockReturnValue(100_000)
  vi.spyOn(axios, 'get').mockResolvedValue({ status: 200 })
    .mockRejectedValueOnce(new AxiosError('Sem conexão', 'ERR_NETWORK'))
  const { api } = await import('../../../src/shared/api/client')
  const enviar = vi.fn(async (config: InternalAxiosRequestConfig) => sucesso(config))
  api.defaults.adapter = enviar

  await api.get('/pacientes')
  relogio.mockReturnValue(130_000)
  await api.get('/pacientes')

  expect(enviar.mock.calls.map(([config]) => config.baseURL)).toEqual([`${reserva}/api/v1`, `${principal}/api/v1`])
})
