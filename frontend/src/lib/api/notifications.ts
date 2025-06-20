
import { NotificationListPayload } from "@/types/notification.types";
import axiosClient from "../axios";

export const fetchNotifications = async (): Promise<NotificationListPayload> => {
  const response = await axiosClient.get<{ data: NotificationListPayload }>(
    "/notifications"
  );
  return response.data.data;
};

export const removeAllNotifications = async () => {
  try {
    const {status} = await axiosClient.post("/notifications/remove-all");
    return status;
  } catch (error) {
    throw error;
  }
};
export const readAllNotifications = async () => {
  try {
    const {status} = await axiosClient.post("/notifications/read-all");
    return status;
  } catch (error) {
    throw error;
  }
};
