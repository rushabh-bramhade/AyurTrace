import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";

export type DbHerbBatch = Tables<"herb_batches">;

export function useBrowseHerbs() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: herbs = [], isLoading: loading, error } = useQuery({
    queryKey: ["herb_batches", "authentic"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("herb_batches")
        .select("*")
        .eq("status", "authentic")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DbHerbBatch[];
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (error) {
    console.error("Error fetching herbs:", error);
  }

  const categories = useMemo(() => {
    const cats = new Set(herbs.map((h) => h.category).filter(Boolean));
    return Array.from(cats).filter(Boolean) as string[];
  }, [herbs]);

  const filtered = useMemo(() => {
    return herbs.filter((herb) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        herb.herb_name.toLowerCase().includes(q) ||
        herb.scientific_name.toLowerCase().includes(q) ||
        herb.harvest_region.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === "All" || herb.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [herbs, search, activeCategory]);

  return {
    herbs: filtered,
    loading,
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    categories,
  };
}
