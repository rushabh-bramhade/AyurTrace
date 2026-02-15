import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Heart, 
  Package, 
  ShieldCheck, 
  Trash2, 
  History, 
  QrCode, 
  User, 
  ChevronRight, 
  Info,
  MapPin,
  Calendar,
  AlertTriangle,
  Bell,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useSavedHerbs } from "@/hooks/useSavedHerbs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import QRScanner from "@/components/QRScanner";
import NotificationPanel from "@/components/NotificationPanel";
import { Json } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface HerbBatch {
  id: string;
  herb_name: string;
  scientific_name: string;
  harvest_region: string;
  batch_code: string;
  price: number;
  unit: string;
  image_url: string | null;
  hash: string | null;
  status: string;
  farmer_id: string;
  harvest_date: string;
  processing_steps: Json;
}

interface SavedHerbRow {
  id: string;
  herb_id: string;
  created_at: string;
  herb_batches: HerbBatch;
}

interface VerificationRecord {
  id: string;
  batch_id: string;
  verified_at: string;
  status: string;
  herb_batches: HerbBatch;
}

interface ProcessingStep {
  date: string;
  step: string;
  description: string;
}

const CustomerDashboard = () => {
  const { user, profile, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { savedIds, toggleSave, isToggling: isSaving } = useSavedHerbs();
  
  const [selectedHerb, setSelectedHerb] = useState<HerbBatch | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [farmerNames, setFarmerNames] = useState<Record<string, string>>({});

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

  // Fetch Saved Herbs
  const { data: savedHerbs = [], isLoading: loadingSaved } = useQuery({
    queryKey: ["saved_herbs", user?.id],
    queryFn: async () => {
      // 1. Fetch saved_herbs rows without join (to avoid relationship errors with TEXT ids)
      const { data: savedRows, error: savedError } = await supabase
        .from("saved_herbs")
        .select(`id, herb_id, created_at`)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (savedError) throw savedError;
      if (!savedRows || savedRows.length === 0) return [];

      // 2. Separate database IDs (UUIDs) from static IDs
      const dbHerbIds = savedRows
        .filter(row => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.herb_id))
        .map(row => row.herb_id);

      // 3. Fetch herb_batches for the DB IDs
      let dbHerbs: HerbBatch[] = [];
      if (dbHerbIds.length > 0) {
        const { data, error } = await supabase
          .from("herb_batches")
          .select("*")
          .in("id", dbHerbIds);
        
        if (!error && data) {
          dbHerbs = data as unknown as HerbBatch[];
        }
      }

      // 4. Load static herbs
      const { herbBatches: staticHerbs } = await import("@/lib/herbs-data");
      
      // 5. Merge data
      const results = savedRows.map(row => {
        // Try DB first
        let herbData = dbHerbs.find(h => h.id === row.herb_id);
        
        // Try static if not in DB
        if (!herbData) {
          const staticMatch = staticHerbs.find(h => h.id === row.herb_id);
          if (staticMatch) {
            herbData = {
              id: staticMatch.id,
              herb_name: staticMatch.herbName,
              scientific_name: staticMatch.scientificName,
              harvest_region: staticMatch.harvestRegion,
              batch_code: staticMatch.id,
              price: staticMatch.price,
              unit: staticMatch.unit,
              image_url: staticMatch.image,
              status: 'authentic',
              farmer_id: 'static',
              harvest_date: staticMatch.harvestDate,
              description: staticMatch.description,
              processing_steps: staticMatch.processingSteps as unknown as Json,
              hash: staticMatch.hash
            };
          } else {
            // Fallback for unknown herbs
            herbData = {
              id: row.herb_id,
              herb_name: "Unknown Herb",
              scientific_name: "N/A",
              harvest_region: "Unknown",
              batch_code: row.herb_id,
              price: 0,
              unit: "unit",
              image_url: null,
              status: 'authentic',
              farmer_id: 'unknown',
              harvest_date: new Date().toISOString(),
              description: "Data for this herb could not be loaded.",
              processing_steps: [],
              hash: null
            };
          }
        }
        
        return {
          id: row.id,
          herb_id: row.herb_id,
          created_at: row.created_at,
          herb_batches: herbData
        };
      });

      return results as unknown as SavedHerbRow[];
    },
    enabled: !!user?.id,
  });

  // Fetch Verification History
  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["verification_history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("verification_history")
        .select(`
          id, batch_id, verified_at, status,
          herb_batches (*)
        `)
        .eq("user_id", user?.id)
        .order("verified_at", { ascending: false });
      
      if (error) throw error;
      return data as unknown as VerificationRecord[];
    },
    enabled: !!user?.id,
  });

  const loadingData = loadingSaved || loadingHistory;

  const fetchFarmerName = async (farmerId: string) => {
    if (farmerNames[farmerId]) return;
    const { data } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", farmerId)
      .maybeSingle();
    if (data) {
      setFarmerNames(prev => ({ ...prev, [farmerId]: data.name }));
    }
  };

  const handleQRScan = (batchCode: string) => {
    setIsScannerOpen(false);
    navigate(`/verify?batch=${batchCode}`);
  };

  const openHerbDetail = (herb: HerbBatch) => {
    setSelectedHerb(herb);
    setIsDetailOpen(true);
    fetchFarmerName(herb.farmer_id);
  };

  const stats = useMemo(() => ({
    totalVerifications: history.length,
    savedCount: savedHerbs.length,
    authenticPercent: history.length > 0 
      ? Math.round((history.filter(h => h.status === "authentic").length / history.length) * 100)
      : 100
  }), [history, savedHerbs]);

  if (loading || !user || !profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {profile.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Welcome, {profile.name}
                </h1>
                <p className="text-muted-foreground text-sm">
                  Track your herbs and verify authenticity.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsScannerOpen(true)} className="gap-2">
                <QrCode className="h-4 w-4" />
                Scan QR
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                    <span className="font-medium text-foreground">{profile.name}</span>
                    <span className="text-xs text-muted-foreground truncate w-full">{user.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/customer/dashboard" className="cursor-pointer">Dashboard</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <NotificationPanel />
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Total Verifications
                </CardDescription>
                <CardTitle className="text-2xl">{stats.totalVerifications}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  Saved Herbs
                </CardDescription>
                <CardTitle className="text-2xl">{stats.savedCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Authenticity Rate
                </CardDescription>
                <CardTitle className="text-2xl">{stats.authenticPercent}%</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Tabs defaultValue="saved">
            <TabsList className="mb-6 w-full sm:w-auto overflow-x-auto">
              <TabsTrigger value="saved" className="gap-1.5 min-w-[120px]">
                <Heart className="h-4 w-4" />
                Saved Herbs
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5 min-w-[150px]">
                <History className="h-4 w-4" />
                Verification History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved">
              {loadingData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                  ))}
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedHerbs.map((item) => (
                    <div
                      key={item.id}
                      className="bg-card rounded-xl border border-border p-5 flex gap-4 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => openHerbDetail(item.herb_batches)}
                    >
                      <div className="h-20 w-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                        {item.herb_batches.image_url ? (
                          <img
                            src={item.herb_batches.image_url}
                            alt={item.herb_batches.herb_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {item.herb_batches.herb_name}
                          </h3>
                          <Badge variant={item.herb_batches.status === 'authentic' ? 'default' : 'secondary'} className="text-[10px]">
                            {item.herb_batches.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground italic truncate mb-2">
                          {item.herb_batches.scientific_name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.herb_batches.harvest_region}</span>
                          <span className="font-bold text-primary">₹{item.herb_batches.price}/{item.herb_batches.unit}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isSaving}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(item.herb_id);
                          }}
                        >
                          {isSaving ? (
                            <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                          ) : (
                            <Heart className="h-5 w-5 fill-current" />
                          )}
                        </Button>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              {loadingData ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <History className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-1">No Verification History</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Verify herb batch codes to see them in your history.
                  </p>
                  <Button onClick={() => setIsScannerOpen(true)}>
                    Verify a Batch
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((record) => (
                    <div 
                      key={record.id}
                      className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => openHerbDetail(record.herb_batches)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-muted">
                          {record.herb_batches.image_url ? (
                            <img 
                              src={record.herb_batches.image_url} 
                              alt={record.herb_batches.herb_name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">No img</div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{record.herb_batches.herb_name}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Verified on {new Date(record.verified_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">Batch Code</p>
                          <p className="text-sm font-mono font-medium">{record.herb_batches.batch_code}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={record.status === 'authentic' ? 'default' : 'destructive'}
                            className="flex items-center gap-1"
                          >
                            {record.status === 'authentic' ? (
                              <ShieldCheck className="h-3 w-3" />
                            ) : (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Herb Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedHerb && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <DialogTitle className="text-2xl font-bold">{selectedHerb.herb_name}</DialogTitle>
                  <div className="flex items-center gap-1.5">
                    {selectedHerb.status === 'active' ? (
                      <Badge className="bg-verified/20 text-verified hover:bg-verified/20 border-verified">Authentic</Badge>
                    ) : (
                      <Badge variant="secondary">{selectedHerb.status}</Badge>
                    )}
                  </div>
                </div>
                <DialogDescription className="italic">{selectedHerb.scientific_name}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div className="aspect-video rounded-xl overflow-hidden bg-muted border border-border">
                    {selectedHerb.image_url ? (
                      <img src={selectedHerb.image_url} alt={selectedHerb.herb_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Blockchain Hash (SHA-256)
                    </h4>
                    <p className="text-[10px] font-mono break-all text-muted-foreground">
                      {selectedHerb.hash || 'Verifying integrity...'}
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Source Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <User className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">{farmerNames[selectedHerb.farmer_id] || 'Loading...'}</p>
                          <p className="text-xs text-muted-foreground">Registered Farmer</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">{selectedHerb.harvest_region}</p>
                          <p className="text-xs text-muted-foreground">Origin Location</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">{new Date(selectedHerb.harvest_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          <p className="text-xs text-muted-foreground">Harvest Date</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Traceability Timeline</h4>
                    <div className="relative border-l-2 border-primary/20 ml-2 pl-4 space-y-4">
                      {Array.isArray(selectedHerb.processing_steps) && (selectedHerb.processing_steps as unknown as ProcessingStep[]).map((step, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                          <p className="text-xs font-bold text-primary">{step.date}</p>
                          <p className="text-sm font-semibold">{step.step}</p>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                      ))}
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-verified border-2 border-background" />
                        <p className="text-xs font-bold text-verified">Final Step</p>
                        <p className="text-sm font-semibold">Quality Verified & Lab Certified</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
                <Button asChild className="gap-2">
                  <Link to={`/verify?batch=${selectedHerb.batch_code}`}>
                    View Full Traceability Report
                  </Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Scanner Modal */}
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Herb QR Code</DialogTitle>
            <DialogDescription>
              Point your camera at the QR code on the herb packaging to verify its authenticity.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <QRScanner onScan={handleQRScan} />
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CustomerDashboard;
