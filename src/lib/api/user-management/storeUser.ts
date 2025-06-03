import axiosClient from "@/lib/axios";
import { UserData } from "@/types/user.types";


export const storeUser = async (body:UserData) => {
    console.log('userId',body)
  const { data } = await axiosClient.post(`/users`,body);
  return data ;
};
