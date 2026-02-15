import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, User, ShieldCheck, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import VerificationStatus from "@/components/VerificationStatus";
import ReviewSection from "@/components/ReviewSection";
import { useCart } from "@/contexts/CartContext";
import { getHerbById } from "@/lib/herbs-data";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProcessingStep {
  step: string;
  date: string;
  description: string;
}

interface HerbData {
  herbName: string;
  scientificName: string;
  description: string | null;
  image: string | null;
  category: string | null;
  harvestRegion: string;
  harvestDate: string;
  price: number;
  unit: string;
  farmer: { name: string; verified: boolean };
  batchCode: string;
  integrityStatus: string;
  processingSteps: ProcessingStep[];
  hash: string | null;
  id: string;
}

const HerbDetail = () => {
  const { id: rawId } = useParams<{ id: string }>();
  const id = rawId?.trim();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const staticHerb = getHerbById(id || "");
  const { data: dbHerb, isLoading: loadingDb } = useQuery({
    queryKey: ["herb_batch", id],
    queryFn: async () => {
      if (!id) return null;
      
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      if (isUuid) {
        const { data, error } = await supabase
          .from("herb_batches")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        if (data) return data;
      }
      
      const { data, error } = await supabase
        .from("herb_batches")
        .select("*")
        .eq("batch_code", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !staticHerb && !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const farmerName = (dbHerb as any)?.farmer_name || (dbHerb as any)?.profiles?.name || "Unknown Farmer";

  // Scroll to top on mount or when id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!staticHerb && loadingDb) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <Skeleton className="aspect-[4/3] rounded-2xl" />
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const herbData: HerbData | null = staticHerb || (dbHerb ? {
    id: dbHerb.id,
    herbName: dbHerb.herb_name,
    scientificName: dbHerb.scientific_name,
    description: dbHerb.description,
    image: dbHerb.image_url,
    category: dbHerb.category,
    harvestRegion: dbHerb.harvest_region,
    harvestDate: dbHerb.harvest_date,
    price: dbHerb.price,
    unit: dbHerb.unit,
    farmer: { name: farmerName, verified: true },
    batchCode: dbHerb.batch_code,
    hash: dbHerb.hash,
    integrityStatus: "verified",
    processingSteps: Array.isArray(dbHerb.processing_steps) 
      ? (dbHerb.processing_steps as unknown as ProcessingStep[]) 
      : []
  } : null);

  if (!herbData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Herb Batch Not Found</h1>
          <p className="text-muted-foreground mb-6">The batch ID you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/browse">Browse Herbs</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" asChild className="mb-6 hover:bg-primary/10">
          <Link to="/browse">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Browse
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: Image Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="sticky top-24"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] relative">
              <img
                src={herbData.image || ""}
                alt={herbData.herbName}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Right: Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-3 py-1">
                  {herbData.category}
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                  Verified
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground leading-tight">
                {herbData.herbName}
              </h1>
              <p className="text-xl text-muted-foreground italic font-medium -mt-2">
                {herbData.scientificName}
              </p>
            </div>

            <p className="text-lg text-foreground/70 leading-relaxed font-body">
              {herbData.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-2xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Origin</p>
                  <p className="text-foreground font-semibold">{herbData.harvestRegion}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Harvested</p>
                  <p className="text-foreground font-semibold">{herbData.harvestDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Farmer</p>
                  <p className="text-foreground font-semibold flex items-center gap-1">
                    {herbData.farmer.name}
                    <ShieldCheck className="h-3.5 w-3.5 text-verified" />
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Batch ID</p>
                  <p className="text-foreground font-mono font-bold tracking-tight">{herbData.batchCode || herbData.id}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 gap-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Market Price</p>
                <div className="text-4xl font-heading font-bold text-primary flex items-baseline gap-1">
                  ₹{herbData.price}
                  <span className="text-base font-body text-muted-foreground font-normal">
                    / {herbData.unit}
                  </span>
                </div>
              </div>
              <Button 
                variant="gold" 
                size="xl" 
                className="w-full sm:w-auto px-8 shadow-lg hover:shadow-xl transition-all h-14 text-lg"
                onClick={() => addToCart({
                  id: herbData.id,
                  name: herbData.herbName,
                  price: herbData.price,
                  image: herbData.image || "",
                  unit: herbData.unit
                })}
              >
                Add to Cart
              </Button>
            </div>

            <VerificationStatus status={herbData.integrityStatus} hash={herbData.hash} />
          </motion.div>
        </div>

        {/* Processing Timeline Section */}
        <section className="mt-24 mb-20">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Processing Timeline</h2>
            <div className="w-20 h-1.5 bg-primary rounded-full" />
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary to-primary/20 rounded-full md:-translate-x-1/2" />
            
            {herbData.processingSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 mb-16 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content Card */}
                <div className={`flex-1 w-full ${i % 2 === 0 ? "md:text-right" : "md:text-left"} pl-16 md:pl-0`}>
                  <div className="bg-card hover:bg-muted/30 transition-colors rounded-2xl p-6 border border-border shadow-sm inline-block text-left w-full max-w-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-heading font-bold text-xl text-foreground">{step.step}</div>
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                        {step.date}
                      </Badge>
                    </div>
                    <p className="text-foreground/70 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Center Dot */}
                <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 w-5 h-5 rounded-full bg-white border-4 border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] z-10" />
                
                {/* Spacer for layout */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Reviews Section - Full Width at Bottom */}
        <section className="mt-20 border-t border-border pt-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Customer Reviews</h2>
              <div className="w-20 h-1.5 bg-primary rounded-full" />
              <p className="text-muted-foreground mt-4 max-w-lg">
                See what other users are saying about this {herbData.herbName} batch.
              </p>
            </div>
            <ReviewSection batchId={herbData.id} />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HerbDetail;
