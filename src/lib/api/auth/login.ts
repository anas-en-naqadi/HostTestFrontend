import axiosClient from "@/lib/axios";

// Login API call
export const login = async (data: { email: string, password: string }) => {
  const response = await axiosClient.post('/auth/login', data);
  return response.data;
};
