import axiosClient from "@/lib/axios";

// Login API call
export const sendEmailVerification = async (email:{email:string}) => {
  const response = await axiosClient.post('/auth/forgot-password',email);
  return response.data;
};