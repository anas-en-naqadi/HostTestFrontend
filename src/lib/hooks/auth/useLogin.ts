// src/lib/hooks/auth/useLogin.ts
import { useMutation } from '@tanstack/react-query'
import { login } from '../../api/auth/login'
import { AxiosError } from 'axios'

interface LoginResponse {
  token: string;
  user: object;
}
interface LoginError {
  message: string;
}

export const useLogin = () =>
  useMutation<
    LoginResponse,                    // <TData>
    AxiosError<LoginError>,           // <TError>
    { email: string; password: string } // <TVariables>
  >({
    mutationFn: login
  })