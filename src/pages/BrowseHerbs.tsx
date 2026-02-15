import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import HerbCard from "@/components/HerbCard";
import DbHerbCard from "@/components/DbHerbCard";
import { herbBatches } from "@/lib/herbs-data";
import { useBrowseHerbs } from "@/hooks/useBrowseHerbs";
import { useAverageRatings } from "@/hooks/useAverageRatings";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const BrowseHerbs = () => {
  const {
    herbs: dbHerbs,
    loading,
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    categories: dbCategories,
    error: dbError
  } = useBrowseHerbs();

  // Filter static herbs
  const filteredStatic = useMemo(() => {
    return herbBatches.filter((herb) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        herb.herbName.toLowerCase().includes(q) ||
        herb.scientificName.toLowerCase().includes(q) ||
        herb.harvestRegion.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === "All" || herb.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  // Merge categories from both sources
  const allCategories = useMemo(() => {
    const staticCats = new Set(herbBatches.map((h) => h.category));
    const merged = new Set([...staticCats, ...dbCategories]);
    return ["All", ...Array.from(merged).sort()];
  }, [dbCategories]);

  const allBatchIds = useMemo(() => {
    const staticIds = filteredStatic.map((h) => h.id);
    const dbIds = dbHerbs.map((h) => h.id);
    return [...staticIds, ...dbIds];
  }, [filteredStatic, dbHerbs]);

  const ratings = useAverageRatings(allBatchIds);

  const totalResults = filteredStatic.length + dbHerbs.length;

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Browse Verified Herbs
            </h1>
            <p className="text-muted-foreground">
              Every herb listed here has been registered and verified through our traceability system.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, scientific name, or region..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <Badge
                  key={cat}
                  variant={activeCategory === cat ? "default" : "secondary"}
                  className="cursor-pointer transition-colors"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
          
          {dbError && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              Failed to load some verified herbs. Please try refreshing the page.
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                  <Skeleton className="w-full aspect-[4/3]" />
                  <div className="p-5 space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : totalResults > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dbHerbs.map((herb) => (
                <DbHerbCard key={herb.id} herb={herb} rating={ratings[herb.id]} />
              ))}
              {filteredStatic.map((herb) => (
                <HerbCard key={herb.id} herb={herb} rating={ratings[herb.id]} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No herbs found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BrowseHerbs;
