import axiosClient from "@/lib/axios";


export const editUser = async (userId:number) => {
    console.log('userId',userId)
  const { data } = await axiosClient.get(`/users/${userId}`);
  return data ;
};
