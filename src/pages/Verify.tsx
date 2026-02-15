import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, QrCode, ShieldCheck, ShieldAlert, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Layout from "@/components/Layout";
import VerificationStatus from "@/components/VerificationStatus";
import QRScanner from "@/components/QRScanner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHerbById } from "@/lib/herbs-data";
import type { HerbBatch as StaticHerbBatch } from "@/lib/herbs-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSavedHerbs } from "@/hooks/useSavedHerbs";
import ReviewSection from "@/components/ReviewSection";
import { verifyIntegrity } from "@/lib/hash-utils";

interface ProcessingStep {
  step: string;
  date: string;
  description: string;
}

interface DbBatch {
  id: string;
  batch_code: string;
  herb_name: string;
  scientific_name: string;
  description: string | null;
  harvest_region: string;
  harvest_date: string;
  processing_steps: ProcessingStep[];
  image_url: string | null;
  price: number;
  unit: string;
  hash: string | null;
  farmer_id: string;
  farmer_name: string | null;
}

interface SupabaseHerbBatch {
  id: string;
  batch_code: string;
  herb_name: string;
  scientific_name: string;
  harvest_region: string;
  harvest_date: string;
  farmer_id: string;
  hash: string | null;
  processing_steps: ProcessingStep[];
  profiles: { name: string } | null;
}

const Verify = () => {
  const [searchParams] = useSearchParams();
  const initialBatchId = searchParams.get("batch") || "";
  const [batchId, setBatchId] = useState(initialBatchId);
  const [dbResult, setDbResult] = useState<DbBatch | null>(null);
  const [farmerName, setFarmerName] = useState<string>("");
  const [isIntegrityOk, setIsIntegrityOk] = useState<boolean | null>(null);
  
  const { user, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { savedIds, toggleSave, isToggling: isSaving } = useSavedHerbs();

  // Optimize: Combine code and ID lookup into a single query or unified state
  const { data: dbHerb, isLoading: isLoadingHerb } = useQuery({
    queryKey: ["herb_batch_lookup", batchId],
    queryFn: async () => {
      if (!batchId) return null;
      const cleanId = batchId.trim();
      
      // Try looking up by batch_code first
      const { data: byCode, error: codeError } = await supabase
        .from("herb_batches")
        .select("*")
        .eq("batch_code", cleanId)
        .maybeSingle();
      
      if (byCode) return byCode;
      
      // If not found by code, try by ID (UUID)
      const { data: byId, error: idError } = await supabase
        .from("herb_batches")
        .select("*")
        .eq("id", cleanId)
        .maybeSingle();
      
      if (idError) throw idError;
      return byId;
    },
    enabled: !!batchId && !getHerbById(batchId),
  });

  const verifyMutation = useMutation({
    mutationFn: async (idToVerify: string) => {
      const code = idToVerify.trim();
      if (!code) throw new Error("Batch ID is required");

      // Check static data first
      const staticHerb = getHerbById(code);
      if (staticHerb) {
        return { type: "static", data: staticHerb };
      }

      // Fetch database
      let { data, error } = await supabase
        .from("herb_batches")
        .select("*")
        .eq("batch_code", code)
        .maybeSingle();
      
      if (!data && !error) {
        const { data: dataById, error: errorById } = await supabase
          .from("herb_batches")
          .select("*")
          .eq("id", code)
          .maybeSingle();
        data = dataById;
        error = errorById;
      }

      if (error) throw error;
      if (!data) return { type: "not_found" };

      // Verify Integrity
      let isValid = false;
      if (data.hash) {
        const stepsString = Array.isArray(data.processing_steps) 
          ? (data.processing_steps as unknown as ProcessingStep[]).map((s) => s.step).join(",")
          : "";
          
        const dataToVerify = {
          batchCode: data.batch_code,
          herbName: data.herb_name,
          scientificName: data.scientific_name,
          farmerName: (data as any).farmer_name || (data as any).profiles?.name || "",
          harvestRegion: data.harvest_region,
          harvestDate: data.harvest_date,
          farmerId: data.farmer_id,
          processingSteps: stepsString,
        };
        
        isValid = await verifyIntegrity(dataToVerify, data.hash);
      }

      // Record verification if user is logged in
      if (user && role === "customer") {
        // Check if already verified today to avoid spamming history
        const today = new Date().toISOString().split('T')[0];
        const { data: existingHistory } = await supabase
          .from("verification_history")
          .select("id")
          .eq("user_id", user.id)
          .eq("batch_id", data.id)
          .gte("verified_at", today)
          .maybeSingle();

        if (!existingHistory) {
          await supabase.from("verification_history").insert({
            user_id: user.id,
            batch_id: data.id,
            status: isValid ? "authentic" : "suspicious"
          });
          queryClient.invalidateQueries({ queryKey: ["verification_history", user.id] });
        }
      }

      return { 
        type: "database", 
        data, 
        isValid, 
        farmerName: (data as unknown as SupabaseHerbBatch).profiles?.name || "Unknown Farmer" 
      };
    },
    onSuccess: (result) => {
      if (result.type === "not_found") {
        setDbResult(null);
        setIsIntegrityOk(null);
        setFarmerName("");
      } else if (result.type === "static") {
        setIsIntegrityOk(true);
      } else if (result.type === "database") {
        setDbResult(result.data as unknown as DbBatch);
        setIsIntegrityOk(result.isValid);
        setFarmerName(result.farmerName);
      }
    },
    onError: (error) => {
      console.error("Verification error:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to verify batch.",
        variant: "destructive",
      });
    }
  });

  const handleVerify = () => {
    verifyMutation.mutate(batchId);
  };

  useEffect(() => {
    if (initialBatchId) {
      setBatchId(initialBatchId);
      verifyMutation.mutate(initialBatchId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBatchId]);

  const handleQRScan = (scannedCode: string) => {
    setBatchId(scannedCode);
    verifyMutation.mutate(scannedCode);
  };

  const steps = dbResult?.processing_steps as unknown as ProcessingStep[] | undefined;

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <QrCode className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Verify Herb Authenticity
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Enter the batch ID or scan a QR code to verify authenticity and view complete provenance data.
            </p>
          </div>

          {/* QR Scanner */}
          <div className="mb-6">
            <QRScanner onScan={handleQRScan} />
          </div>

          <div className="flex gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter Batch ID (e.g. ATB-2025-001)"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button 
              variant="hero" 
              size="lg" 
              onClick={handleVerify} 
              data-verify-btn 
              disabled={verifyMutation.isPending}
              className="min-w-[120px]"
            >
              {verifyMutation.isPending ? <Skeleton className="h-4 w-4 rounded-full mr-2 bg-white/30 animate-pulse" /> : null}
              Verify
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground mb-8">
            <p>Try these sample batch IDs: <button onClick={() => { setBatchId("ATB-2025-001"); verifyMutation.mutate("ATB-2025-001"); }} className="text-primary font-medium hover:underline">ATB-2025-001</button>, <button onClick={() => { setBatchId("ATB-2025-002"); verifyMutation.mutate("ATB-2025-002"); }} className="text-primary font-medium hover:underline">ATB-2025-002</button>, <button onClick={() => { setBatchId("ATB-2025-003"); verifyMutation.mutate("ATB-2025-003"); }} className="text-primary font-medium hover:underline">ATB-2025-003</button></p>
          </div>

          {verifyMutation.isSuccess && verifyMutation.data?.type === "not_found" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-6 border-2 border-tamper bg-tamper/10 text-center"
            >
              <ShieldAlert className="h-12 w-12 text-tamper mx-auto mb-3" />
              <h3 className="font-heading text-xl font-bold text-tamper mb-2">Batch Not Found</h3>
              <p className="text-muted-foreground text-sm">
                No batch with ID "{batchId}" was found in our records. Please check the ID and try again.
              </p>
            </motion.div>
          )}

          {/* Static herb result */}
          {verifyMutation.isSuccess && verifyMutation.data?.type === "static" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <VerificationStatus 
                status={verifyMutation.data.data.integrityStatus} 
                hash={verifyMutation.data.data.hash} 
              />

              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <img src={verifyMutation.data.data.image} alt={verifyMutation.data.data.herbName} className="w-20 h-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-heading text-xl font-bold text-foreground">{verifyMutation.data.data.herbName}</h3>
                    <p className="text-sm text-muted-foreground italic">{verifyMutation.data.data.scientificName}</p>
                    <p className="text-sm text-muted-foreground mt-1">{verifyMutation.data.data.description}</p>
                  </div>
                  {user && role === "customer" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleSave(verifyMutation.data.data.id)} 
                      disabled={isSaving}
                      className="shrink-0 gap-1"
                    >
                      {isSaving ? (
                        <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                      ) : (
                        <Heart 
                          className={cn(
                            "h-4 w-4 transition-colors",
                            savedIds.has(verifyMutation.data.data.id) && "fill-destructive text-destructive"
                          )} 
                        />
                      )}
                      {isSaving ? "Updating..." : savedIds.has(verifyMutation.data.data.id) ? "Saved" : "Save"}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <span className="text-xs text-muted-foreground">Origin</span>
                    <p className="text-sm font-medium text-foreground">{verifyMutation.data.data.harvestRegion}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Harvest Date</span>
                    <p className="text-sm font-medium text-foreground">{verifyMutation.data.data.harvestDate}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Farmer</span>
                    <p className="text-sm font-medium text-foreground">
                      {verifyMutation.data.data.farmer.name}
                      {verifyMutation.data.data.farmer.verified && <ShieldCheck className="h-3.5 w-3.5 text-verified inline ml-1" />}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Batch ID</span>
                    <p className="text-sm font-medium text-foreground font-mono">{verifyMutation.data.data.id}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Processing Timeline</h3>
                <div className="space-y-4">
                  {(verifyMutation.data.data as StaticHerbBatch).processingSteps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        {i < (verifyMutation.data?.data as StaticHerbBatch).processingSteps.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-4">
                        <div className="font-medium text-sm text-foreground">{step.step}</div>
                        <div className="text-xs text-muted-foreground">{step.date}</div>
                        <p className="text-sm text-foreground/70 mt-1">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Database herb result */}
          {verifyMutation.isSuccess && verifyMutation.data?.type === "database" && dbResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {dbResult.hash && (
                <VerificationStatus status={isIntegrityOk ? "verified" : "tampered"} hash={dbResult.hash} />
              )}

              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <div className="flex items-start gap-4">
                  {dbResult.image_url && (
                    <img src={dbResult.image_url} alt={dbResult.herb_name} className="w-20 h-20 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-heading text-xl font-bold text-foreground">{dbResult.herb_name}</h3>
                    <p className="text-sm text-muted-foreground italic">{dbResult.scientific_name}</p>
                    {dbResult.description && (
                      <p className="text-sm text-muted-foreground mt-1">{dbResult.description}</p>
                    )}
                  </div>
                  {user && role === "customer" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleSave(dbResult.id)} 
                      disabled={isSaving}
                      className="shrink-0 gap-1"
                    >
                      {isSaving ? (
                        <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                      ) : (
                        <Heart 
                          className={cn(
                            "h-4 w-4 transition-colors",
                            savedIds.has(dbResult.id) && "fill-destructive text-destructive"
                          )} 
                        />
                      )}
                      {isSaving ? "Updating..." : savedIds.has(dbResult.id) ? "Saved" : "Save"}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <span className="text-xs text-muted-foreground">Origin</span>
                    <p className="text-sm font-medium text-foreground">{dbResult.harvest_region}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Harvest Date</span>
                    <p className="text-sm font-medium text-foreground">{dbResult.harvest_date}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Farmer</span>
                    <p className="text-sm font-medium text-foreground">
                      {farmerName}
                      <ShieldCheck className="h-3.5 w-3.5 text-verified inline ml-1" />
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Batch ID</span>
                    <p className="text-sm font-medium text-foreground font-mono">{dbResult.batch_code}</p>
                  </div>
                </div>
              </div>

              {steps && steps.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Processing Timeline</h3>
                  <div className="space-y-4">
                    {steps.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                          {i < steps.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                        </div>
                        <div className="pb-4">
                          <div className="font-medium text-sm text-foreground">{step.step}</div>
                          <div className="text-xs text-muted-foreground">{step.date}</div>
                          <p className="text-sm text-foreground/70 mt-1">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <ReviewSection batchId={dbResult.id} />
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Verify;
