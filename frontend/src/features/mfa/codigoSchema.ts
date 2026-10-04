import { z } from 'zod'

export const codigoSchema = z.object({ codigo: z.string().trim().regex(/^\d{6}$/, 'Digite os 6 números do aplicativo') })
export type CodigoForm = z.infer<typeof codigoSchema>
