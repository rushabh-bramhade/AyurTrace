import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Package, CheckCircle, XCircle, Trash2, LayoutDashboard, ShieldAlert, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

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
  farmer_name: string | null;
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
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && role && role !== "admin") navigate("/", { replace: true });
  }, [role, loading, navigate]);

  // Queries
  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FarmerProfile[];
    },
    enabled: !!user && role === "admin",
  });

  const { data: farmerRoles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["user_roles", "farmer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "farmer");
      if (error) throw error;
      return data;
    },
    enabled: !!user && role === "admin",
  });

  const { data: batches = [], isLoading: loadingBatches } = useQuery({
    queryKey: ["admin_herb_batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("herb_batches")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as HerbBatch[];
    },
    enabled: !!user && role === "admin",
  });

  const farmers = useMemo(() => {
    const farmerIds = new Set(farmerRoles.map((r) => r.user_id));
    return profiles.filter((p) => farmerIds.has(p.user_id));
  }, [profiles, farmerRoles]);

  // Mutations
  const approveMutation = useMutation({
    mutationFn: async ({ userId, approved }: { userId: string; approved: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ approved })
        .eq("user_id", userId);
      if (error) throw error;
      return approved;
    },
    onSuccess: (approved) => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast({ title: approved ? "Farmer Approved" : "Approval Revoked" });
    },
    onError: (error) => {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    },
  });

  const batchStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("herb_batches")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      return status;
    },
    onSuccess: (status) => {
      queryClient.invalidateQueries({ queryKey: ["admin_herb_batches"] });
      toast({ title: `Batch ${status}` });
    },
    onError: (error) => {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("herb_batches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_herb_batches"] });
      toast({ title: "Batch Deleted" });
    },
    onError: (error) => {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    },
  });

  const loadingData = loadingProfiles || loadingRoles || loadingBatches;

  if (loading || !user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col items-center gap-4 mb-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>  

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 space-y-2">
                <Skeleton className="h-8 w-12 mx-auto" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-6">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24 rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center gap-4 mb-8">
            <div>
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Manage farmer approvals and moderate herb listings.
              </p>
            </div>
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
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                        <div className="flex gap-4">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-9 w-24 rounded-lg shrink-0" />
                    </div>
                  ))}
                </div>
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
                          <Button 
                            size="sm" 
                            onClick={() => approveMutation.mutate({ userId: farmer.user_id, approved: true })} 
                            disabled={approveMutation.isPending}
                            className="gap-1"
                          >
                            {approveMutation.isPending && approveMutation.variables?.userId === farmer.user_id ? (
                              <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Approve
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => approveMutation.mutate({ userId: farmer.user_id, approved: false })} 
                            disabled={approveMutation.isPending}
                            className="gap-1"
                          >
                            {approveMutation.isPending && approveMutation.variables?.userId === farmer.user_id ? (
                              <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Revoke
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
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex gap-3 flex-1 min-w-0">
                        <Skeleton className="w-14 h-14 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-5 w-16" />
                          </div>
                          <div className="flex gap-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-20 rounded-lg" />
                        <Skeleton className="h-9 w-10 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
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
                          <Button 
                            size="sm" 
                            onClick={() => batchStatusMutation.mutate({ id: batch.id, status: "active" })} 
                            disabled={batchStatusMutation.isPending}
                            className="gap-1"
                          >
                            {batchStatusMutation.isPending && batchStatusMutation.variables?.id === batch.id ? (
                              <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Activate
                          </Button>
                        )}
                        {batch.status === "active" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => batchStatusMutation.mutate({ id: batch.id, status: "suspended" })} 
                            disabled={batchStatusMutation.isPending}
                            className="gap-1"
                          >
                            {batchStatusMutation.isPending && batchStatusMutation.variables?.id === batch.id ? (
                              <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Suspend
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => deleteBatchMutation.mutate(batch.id)} 
                          disabled={deleteBatchMutation.isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          {deleteBatchMutation.isPending && deleteBatchMutation.variables === batch.id ? (
                            <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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
