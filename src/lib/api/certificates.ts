import axiosClient from "@/lib/axios";

export type CertificateResponse = {
  id: number;
  progress_percent: number | null;
  courses: {
    id: number;
    title: string;
    thumbnail_url: string;
    slug: string;
  };
}[];

export type CertificateCreateResponse = {
  id: number;
  certificate_code: string;
  created_at: string;
  downloadUrl: string;
  verificationUrl: string;
};

export const fetchCertificates = async (): Promise<{
  data: CertificateResponse;
  message: string;
  status: number;
}> => {
  try {
    const response = await axiosClient.get('/certificates');
    return response.data;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
};

// Create a certificate after quiz completion
export const createCertificate = async (enrollmentId: number ): Promise<{
  success: boolean;
  message: string;
  data: CertificateCreateResponse | null;
}> => {
  try {
    const response = await axiosClient.post('/certificates', {
      enrollmentId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating certificate:', error);
    throw error;
  }
};

// Download a certificate by enrollment ID
export const downloadCertificate = async (enrollmentId: number): Promise<Blob> => {
  try {
    const response = await axiosClient.get(`/certificates/${enrollmentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading certificate:', error);
    throw error;
  }
};
