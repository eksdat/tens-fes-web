import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { api } from '../../shared/api/client'
import type { Sessao } from '../../shared/auth/sessaoStorage'
import { useAuth } from '../../shared/auth/useAuth'

const schema = z.object({
  email: z.email('Informe um e-mail válido.'),
  senha: z.string().min(1, 'Informe a senha.'),
})

type LoginForm = z.infer<typeof schema>

export function LoginPage() {
  const { entrar } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) })

  const login = useMutation({
    mutationFn: (dados: LoginForm) => api.post<Sessao>('/auth/login', dados).then((r) => r.data),
    onSuccess: (sessao) => {
      entrar(sessao)
      navigate('/')
    },
  })

  return (
    <main>
      <h1>Entrar</h1>
      <form onSubmit={handleSubmit((dados) => login.mutate(dados))} noValidate>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-erro' : undefined}
          {...register('email')}
        />
        {errors.email && <p id="email-erro">{errors.email.message}</p>}

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.senha}
          aria-describedby={errors.senha ? 'senha-erro' : undefined}
          {...register('senha')}
        />
        {errors.senha && <p id="senha-erro">{errors.senha.message}</p>}

        <p role="alert">{login.isError && 'E-mail ou senha incorretos.'}</p>

        <button type="submit" disabled={login.isPending}>
          Entrar
        </button>
      </form>
    </main>
  )
}
