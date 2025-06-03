import { useQueryClient } from '@tanstack/react-query';

export function useClearDashboardCache() {
  const qc = useQueryClient();

  return () => {
    const keys = [
      ['nextLearning'],
      ['fieldSuggestions'],
      ['dashboardCharts'],
      ['dashboardStats'],
    ] as const;

    for (const queryKey of keys) {
      qc.invalidateQueries({
        queryKey,
        // drop `exact: true` so you catch any variants,
        // and also refresh even if the Dashboard isn’t mounted:
  refetchType: 'all'      });
    }
  };
}
