import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DbHerbBatch = Tables<"herb_batches">;

export function useBrowseHerbs() {
  const [herbs, setHerbs] = useState<DbHerbBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchHerbs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("herb_batches")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setHerbs(data);
      }
      setLoading(false);
    };

    fetchHerbs();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(herbs.map((h) => h.category).filter(Boolean));
    return ["All", ...Array.from(cats)] as string[];
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
