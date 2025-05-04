import axiosClient from "@/lib/axios";

// Login API call
export const resetPassword = async (data:object) => {
  const response = await axiosClient.post('/auth/reset-password',data);
  return response.data;
};