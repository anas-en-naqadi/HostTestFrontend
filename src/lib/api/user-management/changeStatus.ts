import axiosClient from "@/lib/axios";

export const changeUserStatus = async ({
  user_id,
  status,
}: {
  user_id: number;
  status: boolean;
}) => {
  const payload = {
    user_id,
    status: status ? "active" : "inactive",
  };

  const { data } = await axiosClient.post("/users/change-status", payload);
  return data;
};
