// src/lib/hooks/auth/useSendEmailVerification.ts
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { sendEmailVerification } from '@/lib/api'


// 1) Define the shapes coming back from your API
export interface SendEmailResponse {
  message: string
}
export interface SendEmailError {
  message: string
}

// 2) Annotate useMutation with <TData, TError, TVariables>
export const useSendEmailVerification = () => {
  return useMutation<
    SendEmailResponse,              
    AxiosError<SendEmailError>,     
    { email: string }               
  >({
    mutationFn: sendEmailVerification
  })
}
