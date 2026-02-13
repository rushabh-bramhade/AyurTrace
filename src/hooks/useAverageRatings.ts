import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RatingData {
  avg: number;
  count: number;
}

export function useAverageRatings(batchIds: string[]) {
  const [ratings, setRatings] = useState<Record<string, RatingData>>({});

  useEffect(() => {
    if (batchIds.length === 0) return;

    const fetchRatings = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("batch_id, rating")
        .in("batch_id", batchIds);

      if (error || !data) return;

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
      setRatings(result);
    };

    fetchRatings();
  }, [batchIds.join(",")]);

  return ratings;
}
