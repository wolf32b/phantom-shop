import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useRobuxCounter() {
  return useQuery({
    queryKey: [api.stats.getRobuxCounter.path],
    queryFn: async () => {
      // In a real implementation, this endpoint would exist in backend routes
      // Currently using a mock fallback if endpoint misses
      try {
        const res = await fetch(api.stats.getRobuxCounter.path);
        if (res.ok) {
          return api.stats.getRobuxCounter.responses[200].parse(await res.json());
        }
        return { value: 0 };
      } catch {
        return { value: 0 };
      }
    },
    refetchInterval: 5000,
  });
}
