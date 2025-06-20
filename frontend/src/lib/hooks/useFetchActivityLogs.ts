import { useState, useCallback } from 'react';
import { fetchActivityLogs } from '@/lib/api/activityLogs';
import { ActivityLog } from '@/components/ui/ActivityLogsTable';

export const useFetchActivityLogs = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
 

  const fetchLogs = useCallback(async (
    sortBy: "created_at" | "activity_type" | "actor_full_name" = "created_at",
    sortOrder: "asc" | "desc" = "desc"
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const logs = await fetchActivityLogs(sortBy, sortOrder);
      setActivityLogs(logs);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch activity logs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    activityLogs,
    isLoading,
    error,
    fetchActivityLogs: fetchLogs
  };
};