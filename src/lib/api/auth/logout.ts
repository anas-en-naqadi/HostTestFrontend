import axiosClient from "@/lib/axios";

// Logout API call
export const logout = async () => {
    const response = await axiosClient.post('/auth/logout');
    return response.data;
  };
  