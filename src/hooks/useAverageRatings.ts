import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RatingData {
  avg: number;
  count: number;
}

export function useAverageRatings(batchIds: string[]) {
  const idsKey = batchIds.sort().join(",");

  const { data: ratings = {} } = useQuery({
    queryKey: ["average_ratings", idsKey],
    queryFn: async () => {
      if (batchIds.length === 0) return {};

      const { data, error } = await supabase
        .from("reviews")
        .select("batch_id, rating")
        .in("batch_id", batchIds);

      if (error) throw error;
      if (!data) return {};

      const grouped: Record<string, number[]> = {};
      for (const r of data) {
        if (!grouped[r.batch_id]) grouped[r.batch_id] = [];
        grouped[r.batch_id].push(r.rating);
      }

      const result: Record<string, RatingData> = {};
      for (const [id, vals] of Object.entries(grouped)) {
        result[id] = {
          avg: vals.reduce((a, b) => a + b, 0) / vals.length,
          count: vals.length,
        };
      }
      return result;
    },
    enabled: batchIds.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });

  return ratings;
}
