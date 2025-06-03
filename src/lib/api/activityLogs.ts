import axiosClient from "@/lib/axios";
import { ActivityLog } from "@/components/ui/ActivityLogsTable";

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export interface ActivityLogsResponse {
  data: ActivityLog[];
  pagination: PaginationInfo;
}

/**
 * Fetches paginated activity logs from the backend with optional sorting
 */
export const fetchActivityLogs = async (
  sortBy: "created_at" | "activity_type" | "actor_full_name" = "created_at",
  sortOrder: "asc" | "desc" = "desc"
): Promise<ActivityLog[]> => {
  try {
    const response = await axiosClient.get("/activity-logs", {
      params: { sortBy, sortOrder },
    });

    if (response.status === 200 && response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to fetch activity logs");
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    throw error;
  }
};
