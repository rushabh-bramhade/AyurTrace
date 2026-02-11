import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Package, CheckCircle, XCircle, Trash2, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FarmerProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  region: string | null;
  certifications: string | null;
  approved: boolean;
  created_at: string;
}

interface HerbBatch {
  id: string;
  batch_code: string;
  herb_name: string;
  scientific_name: string;
  harvest_region: string;
  category: string | null;
  status: string;
  price: number;
  unit: string;
  image_url: string | null;
  created_at: string;
  farmer_id: string;
}

const AdminDashboard = () => {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [batches, setBatches] = useState<HerbBatch[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && role && role !== "admin") navigate("/", { replace: true });
  }, [role, loading, navigate]);

  const fetchData = async () => {
    setLoadingData(true);
    const [farmersRes, batchesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("herb_batches").select("*").order("created_at", { ascending: false }),
    ]);

    // Filter to only farmer profiles by checking user_roles
    if (farmersRes.data) {
      const { data: farmerRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "farmer");
      const farmerIds = new Set(farmerRoles?.map((r) => r.user_id) || []);
      setFarmers(farmersRes.data.filter((p) => farmerIds.has(p.user_id)));
    }
    if (batchesRes.data) setBatches(batchesRes.data);
    setLoadingData(false);
  };

  useEffect(() => {
    if (user && role === "admin") fetchData();
  }, [user, role]);

  const handleApprove = async (userId: string, approved: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ approved })
      .eq("user_id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: approved ? "Farmer Approved" : "Approval Revoked" });
      fetchData();
    }
  };

  const handleBatchStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("herb_batches")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Batch ${status}` });
      fetchData();
    }
  };

  const handleDeleteBatch = async (id: string) => {
    const { error } = await supabase.from("herb_batches").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Batch Deleted" });
      fetchData();
    }
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
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
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Manage farmer approvals and moderate herb listings.
              </p>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Log Out
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{farmers.length}</p>
              <p className="text-xs text-muted-foreground">Total Farmers</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-primary">{farmers.filter((f) => f.approved).length}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{batches.length}</p>
              <p className="text-xs text-muted-foreground">Total Batches</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-primary">{batches.filter((b) => b.status === "active").length}</p>
              <p className="text-xs text-muted-foreground">Active Batches</p>
            </div>
          </div>

          <Tabs defaultValue="farmers">
            <TabsList className="mb-6">
              <TabsTrigger value="farmers" className="gap-1.5">
                <Users className="h-4 w-4" /> Farmers
              </TabsTrigger>
              <TabsTrigger value="batches" className="gap-1.5">
                <Package className="h-4 w-4" /> Herb Batches
              </TabsTrigger>
            </TabsList>

            <TabsContent value="farmers">
              {loadingData ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : farmers.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No farmer accounts found.</p>
              ) : (
                <div className="space-y-3">
                  {farmers.map((farmer) => (
                    <div key={farmer.id} className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{farmer.name}</h3>
                          <Badge variant={farmer.approved ? "default" : "secondary"}>
                            {farmer.approved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                          <span>{farmer.email}</span>
                          {farmer.region && <span>Region: {farmer.region}</span>}
                          {farmer.certifications && <span>Certs: {farmer.certifications}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined: {new Date(farmer.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!farmer.approved ? (
                          <Button size="sm" onClick={() => handleApprove(farmer.user_id, true)} className="gap-1">
                            <CheckCircle className="h-4 w-4" /> Approve
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleApprove(farmer.user_id, false)} className="gap-1">
                            <XCircle className="h-4 w-4" /> Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="batches">
              {loadingData ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : batches.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No herb batches found.</p>
              ) : (
                <div className="space-y-3">
                  {batches.map((batch) => (
                    <div key={batch.id} className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex gap-3 flex-1 min-w-0">
                        {batch.image_url && (
                          <img src={batch.image_url} alt={batch.herb_name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">{batch.herb_name}</h3>
                            {batch.category && <Badge variant="secondary">{batch.category}</Badge>}
                            <Badge variant={batch.status === "active" ? "default" : "secondary"}>{batch.status}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                            <span>{batch.batch_code}</span>
                            <span>{batch.harvest_region}</span>
                            <span>₹{batch.price}/{batch.unit}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {batch.status !== "active" && (
                          <Button size="sm" onClick={() => handleBatchStatus(batch.id, "active")} className="gap-1">
                            <CheckCircle className="h-4 w-4" /> Activate
                          </Button>
                        )}
                        {batch.status === "active" && (
                          <Button size="sm" variant="outline" onClick={() => handleBatchStatus(batch.id, "suspended")} className="gap-1">
                            <XCircle className="h-4 w-4" /> Suspend
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleDeleteBatch(batch.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;
