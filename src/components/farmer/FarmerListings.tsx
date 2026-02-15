import { useState, useMemo } from "react";
import { Package, ShieldCheck, Trash2, QrCode, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import BatchQRCode from "./BatchQRCode";
import StarRating from "@/components/StarRating";
import { useAverageRatings } from "@/hooks/useAverageRatings";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReviewSection from "@/components/ReviewSection";
import { Skeleton } from "@/components/ui/skeleton";

interface FarmerListingsProps {
  farmerId: string;
}

const FarmerListings = ({ farmerId }: FarmerListingsProps) => {
  const [showQR, setShowQR] = useState<string | null>(null);
  const [showReviews, setShowReviews] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: batches = [], isLoading: loading } = useQuery({
    queryKey: ["herb_batches", "farmer", farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("herb_batches")
        .select("*")
        .eq("farmer_id", farmerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Tables<"herb_batches">[];
    },
    enabled: !!farmerId,
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, batchCode }: { id: string; batchCode: string }) => {
      const { error } = await supabase.from("herb_batches").delete().eq("id", id);
      if (error) throw error;
      return batchCode;
    },
    onSuccess: (batchCode) => {
      queryClient.invalidateQueries({ queryKey: ["herb_batches", "farmer", farmerId] });
      toast({ title: "Deleted", description: `Batch ${batchCode} has been removed.` });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: (error as Error).message || "Failed to delete batch. It might be linked to other data.", 
        variant: "destructive" 
      });
    },
  });

  const batchIds = useMemo(() => batches.map((b) => b.id), [batches]);
  const ratings = useAverageRatings(batchIds);

  const handleDelete = (id: string, batchCode: string) => {
    deleteMutation.mutate({ id, batchCode });
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col md:flex-row gap-6 p-4">
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
    );
  }

  if (batches.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-xl border border-border">
        <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">No Listings Yet</h3>
        <p className="text-muted-foreground text-sm">Start by adding your first herb batch.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {batches.map((batch) => (
        <div key={batch.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="w-full md:w-48 h-48 md:h-auto relative bg-secondary/20 overflow-hidden shrink-0">
              {batch.image_url ? (
                <img
                  src={batch.image_url}
                  alt={batch.herb_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                  <Package className="h-12 w-12" />
                </div>
              )}
              <div className="absolute top-3 left-3">
                <div className="bg-background/90 backdrop-blur text-primary border border-primary/20 font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded">
                  {batch.category || 'Herb'}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="flex justify-between items-start gap-4 mb-2">
                <div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{batch.herb_name}</h3>
                  <p className="text-sm italic text-muted-foreground">{batch.scientific_name}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-bold text-primary">₹{batch.price}</div>
                  <div className="text-xs text-muted-foreground">per {batch.unit}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 my-4 py-4 border-y border-border/50">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/60">Batch ID</span>
                  <div className="text-xs font-mono font-medium truncate bg-secondary/50 px-2 py-0.5 rounded">{batch.batch_code}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/60">Region</span>
                  <div className="text-xs font-medium truncate flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-primary/70" />
                    {batch.harvest_region}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/60">Rating</span>
                  <div className="flex items-center gap-1.5">
                    {ratings[batch.id] ? (
                      <StarRating avg={ratings[batch.id].avg} count={ratings[batch.id].count} />
                    ) : (
                      <span className="text-xs text-muted-foreground">No ratings</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-4 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                    onClick={() => {
                      setShowQR(showQR === batch.id ? null : batch.id);
                      setShowReviews(null);
                    }}
                  >
                    <QrCode className="h-4 w-4" />
                    QR Code
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-4 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                    onClick={() => {
                      setShowReviews(showReviews === batch.id ? null : batch.id);
                      setShowQR(null);
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Reviews
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 px-4 gap-2 text-primary hover:bg-primary/5 transition-colors"
                    asChild
                  >
                    <a href={`/verify?batch=${batch.batch_code}`} target="_blank" rel="noopener noreferrer">
                      <ShieldCheck className="h-4 w-4" />
                      View Verification
                    </a>
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => handleDelete(batch.id, batch.batch_code)}
                  disabled={deleteMutation.isPending && deleteMutation.variables?.id === batch.id}
                >
                  {deleteMutation.isPending && deleteMutation.variables?.id === batch.id ? (
                    <Skeleton className="h-4 w-4 rounded-full animate-pulse mx-auto" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {showQR === batch.id && (
                <div className="mt-4 flex justify-center p-4 bg-muted/30 rounded-lg border border-dashed border-border">
                  <BatchQRCode batchCode={batch.batch_code} size={160} />
                </div>
              )}

              {showReviews === batch.id && (
                <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-border overflow-hidden">
                  <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Batch Reviews
                  </h4>
                  <ReviewSection batchId={batch.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FarmerListings;
