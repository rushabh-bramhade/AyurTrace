import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Package, Leaf } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import AddHerbBatchForm from "@/components/farmer/AddHerbBatchForm";
import FarmerListings from "@/components/farmer/FarmerListings";
import { Skeleton } from "@/components/ui/skeleton";

const FarmerDashboard = () => {
  const { user, profile, role, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("listings");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && role && role !== "farmer") {
      navigate("/", { replace: true });
    }
  }, [role, loading, navigate]);

  if (loading || !user || !profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-card rounded-lg border border-border p-3 md:p-4 shadow-sm flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="bg-card border border-border p-1 h-auto gap-1 flex rounded-lg">
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6 shadow-sm space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col md:flex-row gap-6">
                <Skeleton className="w-full md:w-48 h-48 rounded-xl shrink-0" />
                <div className="flex-1 space-y-4 py-2">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-8 md:py-12 bg-secondary/30 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-card rounded-lg border border-border p-3 md:p-4 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                <Leaf className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                  Farmer Dashboard
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Welcome back, <span className="text-foreground font-semibold">{profile.name}</span>. 
                  Manage harvest listings and track batches.
                </p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-card border border-border p-1 h-auto gap-1">
                <TabsTrigger 
                  value="listings" 
                  className="gap-2 py-2.5 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all rounded-lg"
                >
                  <Package className="h-4 w-4" />
                  My Listings
                </TabsTrigger>
                <TabsTrigger 
                  value="add" 
                  className="gap-2 py-2.5 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                  Add New Batch
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="listings" className="mt-0 focus-visible:outline-none">
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6 shadow-sm">
                <FarmerListings farmerId={user.id} />
              </div>
            </TabsContent>

            <TabsContent value="add" className="mt-0 focus-visible:outline-none">
              <AddHerbBatchForm
                farmerId={user.id}
                initialFarmerName={profile.name}
                onSuccess={() => setActiveTab("listings")}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default FarmerDashboard;
