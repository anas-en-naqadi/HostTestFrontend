import { useMutation } from '@tanstack/react-query';
import { createCertificate, CertificateCreateResponse } from '../api/certificates';
import { toast } from 'sonner';

// Hook for creating a certificate after quiz completion
export const useCreateCertificate = () => {
  return useMutation({
    mutationFn: async (
      enrollmentId :number 
    ) => {
      const response = await createCertificate(enrollmentId);
      return response;
    }
  });
};


