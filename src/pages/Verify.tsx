import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, QrCode, ShieldCheck, ShieldAlert, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import VerificationStatus from "@/components/VerificationStatus";
import QRScanner from "@/components/QRScanner";
import { getHerbById, getHerbDataForHash } from "@/lib/herbs-data";
import type { HerbBatch } from "@/lib/herbs-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ReviewSection from "@/components/ReviewSection";

interface DbBatch {
  id: string;
  batch_code: string;
  herb_name: string;
  scientific_name: string;
  description: string | null;
  harvest_region: string;
  harvest_date: string;
  processing_steps: any;
  image_url: string | null;
  price: number;
  unit: string;
  hash: string | null;
  farmer_id: string;
}

const Verify = () => {
  const [searchParams] = useSearchParams();
  const initialBatchId = searchParams.get("batch") || "";
  const [batchId, setBatchId] = useState(initialBatchId);
  const [result, setResult] = useState<HerbBatch | null>(null);
  const [dbResult, setDbResult] = useState<DbBatch | null>(null);
  const [farmerName, setFarmerName] = useState<string>("");
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);
  const { user, role } = useAuth();
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!batchId.trim()) return;
    setSearched(true);
    setResult(null);
    setDbResult(null);
    setFarmerName("");

    // Check static data first
    const herb = getHerbById(batchId.trim());
    if (herb) {
      setResult(herb);
      setNotFound(false);
      return;
    }

    // Check database
    const { data, error } = await supabase
      .from("herb_batches")
      .select("*")
      .eq("batch_code", batchId.trim())
      .maybeSingle();

    if (data) {
      setDbResult(data);
      setNotFound(false);
      // Fetch farmer name
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", data.farmer_id)
        .maybeSingle();
      setFarmerName(profileData?.name || "Unknown Farmer");
    } else {
      setNotFound(true);
    }
  };

  const handleSaveHerb = async () => {
    if (!user || !dbResult) return;
    const { error } = await supabase.from("saved_herbs").insert({
      user_id: user.id,
      batch_id: dbResult.id,
    });
    if (error) {
      if (error.message.includes("duplicate") || error.code === "23505") {
        toast({ title: "Already Saved", description: "This herb is already in your saved list." });
      } else {
        toast({ title: "Error", description: "Failed to save herb.", variant: "destructive" });
      }
    } else {
      toast({ title: "Saved!", description: "Herb added to your saved list." });
    }
  };

  const handleQRScan = (scannedBatchId: string) => {
    setBatchId(scannedBatchId);
    // Auto-verify after scan
    setTimeout(() => {
      const el = document.querySelector<HTMLButtonElement>("[data-verify-btn]");
      el?.click();
    }, 100);
  };

  const steps = dbResult?.processing_steps as Array<{ step: string; date: string; description: string }> | undefined;

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
            <Button variant="hero" size="lg" onClick={handleVerify} data-verify-btn>
              Verify
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground mb-8">
            <p>Try these sample batch IDs: <button onClick={() => setBatchId("ATB-2025-001")} className="text-primary font-medium hover:underline">ATB-2025-001</button>, <button onClick={() => setBatchId("ATB-2025-002")} className="text-primary font-medium hover:underline">ATB-2025-002</button>, <button onClick={() => setBatchId("ATB-2025-003")} className="text-primary font-medium hover:underline">ATB-2025-003</button></p>
          </div>

          {searched && notFound && (
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
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <VerificationStatus status={result.integrityStatus} hash={result.hash} />

              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <img src={result.image} alt={result.herbName} className="w-20 h-20 rounded-lg object-cover" />
                  <div>
                    <h3 className="font-heading text-xl font-bold text-foreground">{result.herbName}</h3>
                    <p className="text-sm text-muted-foreground italic">{result.scientificName}</p>
                    <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <span className="text-xs text-muted-foreground">Origin</span>
                    <p className="text-sm font-medium text-foreground">{result.harvestRegion}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Harvest Date</span>
                    <p className="text-sm font-medium text-foreground">{result.harvestDate}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Farmer</span>
                    <p className="text-sm font-medium text-foreground">
                      {result.farmer.name}
                      {result.farmer.verified && <ShieldCheck className="h-3.5 w-3.5 text-verified inline ml-1" />}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Batch ID</span>
                    <p className="text-sm font-medium text-foreground font-mono">{result.id}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Processing Timeline</h3>
                <div className="space-y-4">
                  {result.processingSteps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        {i < result.processingSteps.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
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
          {dbResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {dbResult.hash && (
                <VerificationStatus status="verified" hash={dbResult.hash} />
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
                    <Button variant="outline" size="sm" onClick={handleSaveHerb} className="shrink-0 gap-1">
                      <Heart className="h-4 w-4" />
                      Save
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
