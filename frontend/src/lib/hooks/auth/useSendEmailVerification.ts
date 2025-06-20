// src/lib/hooks/auth/useSendEmailVerification.ts
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { sendEmailVerification } from '@/lib/api'


export interface SendEmailResponse {
  message: string
}
export interface SendEmailError {
  message: string
}

export const useSendEmailVerification = () => {
  return useMutation<
    SendEmailResponse,              
    AxiosError<SendEmailError>,     
    { email: string }               
  >({
    mutationFn: sendEmailVerification
  })
}
