import { useContext } from 'react'
import { ContextoDoAparelhoReact } from './estado'

export const useEstadoDoAparelho = () => useContext(ContextoDoAparelhoReact)
