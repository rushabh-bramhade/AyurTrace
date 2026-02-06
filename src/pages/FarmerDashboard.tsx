import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Package, Leaf, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import AddHerbBatchForm from "@/components/farmer/AddHerbBatchForm";
import FarmerListings from "@/components/farmer/FarmerListings";

const FarmerDashboard = () => {
  const { user, profile, role, loading, signOut } = useAuth();
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
                Farmer Dashboard
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Welcome, {profile.name}. Manage your herb listings.
              </p>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" />
              Log Out
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="listings" className="gap-1.5">
                <Package className="h-4 w-4" />
                My Listings
              </TabsTrigger>
              <TabsTrigger value="add" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Batch
              </TabsTrigger>
            </TabsList>

            <TabsContent value="listings">
              <FarmerListings farmerId={user.id} />
            </TabsContent>

            <TabsContent value="add">
              <AddHerbBatchForm
                farmerId={user.id}
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
