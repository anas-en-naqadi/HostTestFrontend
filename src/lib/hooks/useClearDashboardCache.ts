// hooks/useClearDashboardCache.ts
import { useQueryClient } from '@tanstack/react-query';

export function useClearDashboardCache() {
  const queryClient = useQueryClient();

  return () => {
    // List your dashboard‐related keys here:
    const keys = [
      ['nextLearning'],
      ['fieldSuggestions'],
      ['dashboardCharts'],
      ['dashboardStats'],
    ] as const;

    keys.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: queryKey, exact: true });
    });

    // If you ever want to nuke *all* queries:
    // queryClient.removeQueries();  
}
}
