import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import HerbCard from "@/components/HerbCard";
import DbHerbCard from "@/components/DbHerbCard";
import { herbBatches } from "@/lib/herbs-data";
import { useBrowseHerbs } from "@/hooks/useBrowseHerbs";
import { useAverageRatings } from "@/hooks/useAverageRatings";
import { useState, useMemo } from "react";

const BrowseHerbs = () => {
  const [localSearch, setLocalSearch] = useState("");
  const [localCategory, setLocalCategory] = useState("All");
  const {
    herbs: dbHerbs,
    loading,
    search: dbSearch,
    setSearch: setDbSearch,
    activeCategory: dbCategory,
    setActiveCategory: setDbCategory,
    categories: dbCategories,
  } = useBrowseHerbs();

  // Combine search state
  const search = localSearch;
  const setSearch = (val: string) => {
    setLocalSearch(val);
    setDbSearch(val);
  };
  const activeCategory = localCategory;
  const setActiveCategory = (val: string) => {
    setLocalCategory(val);
    setDbCategory(val);
  };

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
    const merged = new Set([...staticCats, ...dbCategories.filter((c) => c !== "All")]);
    return ["All", ...Array.from(merged).sort()];
  }, [dbCategories]);

  const batchIds = useMemo(() => dbHerbs.map((h) => h.id), [dbHerbs]);
  const ratings = useAverageRatings(batchIds);

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

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : totalResults > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStatic.map((herb) => (
                <HerbCard key={herb.id} herb={herb} />
              ))}
              {dbHerbs.map((herb) => (
                <DbHerbCard key={herb.id} herb={herb} rating={ratings[herb.id]} />
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
