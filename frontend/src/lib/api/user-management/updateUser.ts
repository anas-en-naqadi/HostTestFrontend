import axiosClient from "@/lib/axios";
import { ApiUser } from "@/types/user.types";


export const updateUser = async ({ userId, body }:{userId:number,body:ApiUser}) => {
    console.log('userId',userId)
  const { data } = await axiosClient.put(`/users/${userId}`,body);
  return data ;
};
