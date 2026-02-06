import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import HerbCard from "@/components/HerbCard";
import { herbBatches } from "@/lib/herbs-data";

const categories = ["All", ...Array.from(new Set(herbBatches.map((h) => h.category)))];

const BrowseHerbs = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = herbBatches.filter((herb) => {
    const matchesSearch =
      herb.herbName.toLowerCase().includes(search.toLowerCase()) ||
      herb.scientificName.toLowerCase().includes(search.toLowerCase()) ||
      herb.harvestRegion.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || herb.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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
              {categories.map((cat) => (
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

          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((herb) => (
                <HerbCard key={herb.id} herb={herb} />
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
