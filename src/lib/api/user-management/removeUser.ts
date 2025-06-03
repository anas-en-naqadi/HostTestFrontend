import axiosClient from "@/lib/axios";


export const removeUser = async (userId:number) => {
  const { data } = await axiosClient.delete(`/users/${userId}`);
  return data ;
};
