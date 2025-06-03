import axiosClient from "@/lib/axios";


export const fetchUsers = async () => {
  const { data } = await axiosClient.get(`/users`);
  return data ;
};
