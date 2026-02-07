import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Package, LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SavedHerbRow {
  id: string;
  batch_id: string;
  created_at: string;
  herb_batches: {
    id: string;
    herb_name: string;
    scientific_name: string;
    harvest_region: string;
    batch_code: string;
    price: number;
    unit: string;
    image_url: string | null;
    hash: string | null;
  };
}

const CustomerDashboard = () => {
  const { user, profile, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [savedHerbs, setSavedHerbs] = useState<SavedHerbRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && role && role !== "customer") {
      navigate("/", { replace: true });
    }
  }, [role, loading, navigate]);

  const fetchSavedHerbs = async () => {
    if (!user) return;
    setLoadingData(true);
    const { data, error } = await supabase
      .from("saved_herbs")
      .select(`
        id,
        batch_id,
        created_at,
        herb_batches (
          id,
          herb_name,
          scientific_name,
          harvest_region,
          batch_code,
          price,
          unit,
          image_url,
          hash
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSavedHerbs(data as unknown as SavedHerbRow[]);
    }
    setLoadingData(false);
  };

  useEffect(() => {
    if (user && role === "customer") {
      fetchSavedHerbs();
    }
  }, [user, role]);

  const handleRemoveSaved = async (savedId: string) => {
    const { error } = await supabase.from("saved_herbs").delete().eq("id", savedId);
    if (!error) {
      toast({ title: "Removed", description: "Herb removed from saved list." });
      fetchSavedHerbs();
    }
  };

  if (loading || !user || !profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Customer Dashboard
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Welcome, {profile.name}. View your saved herbs and verification history.
              </p>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" />
              Log Out
            </Button>
          </div>

          <Tabs defaultValue="saved">
            <TabsList className="mb-6">
              <TabsTrigger value="saved" className="gap-1.5">
                <Heart className="h-4 w-4" />
                Saved Herbs
              </TabsTrigger>
              <TabsTrigger value="browse" className="gap-1.5">
                <Package className="h-4 w-4" />
                Browse All
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved">
              {loadingData ? (
                <p className="text-muted-foreground py-8 text-center">Loading saved herbs...</p>
              ) : savedHerbs.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <Heart className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-1">No Saved Herbs</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Browse herbs and save your favorites for quick access.
                  </p>
                  <Button asChild>
                    <Link to="/browse">Browse Herbs</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedHerbs.map((item) => (
                    <div
                      key={item.id}
                      className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      {item.herb_batches.image_url && (
                        <img
                          src={item.herb_batches.image_url}
                          alt={item.herb_batches.herb_name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {item.herb_batches.herb_name}
                          </h3>
                          <span className="text-xs text-muted-foreground italic">
                            {item.herb_batches.scientific_name}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span>Batch: {item.herb_batches.batch_code}</span>
                          <span>Region: {item.herb_batches.harvest_region}</span>
                          <span>₹{item.herb_batches.price}/{item.herb_batches.unit}</span>
                        </div>
                        {item.herb_batches.hash && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            SHA-256 verified
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/verify?batch=${item.herb_batches.batch_code}`}>
                            Verify
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveSaved(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="browse">
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Explore Verified Herbs
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Browse all verified herb batches from trusted farmers.
                </p>
                <Button asChild>
                  <Link to="/browse">Go to Browse</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default CustomerDashboard;
