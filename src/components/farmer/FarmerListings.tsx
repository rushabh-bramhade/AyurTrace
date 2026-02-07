import { useEffect, useState } from "react";
import { Package, ShieldCheck, Trash2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import BatchQRCode from "./BatchQRCode";

interface FarmerListingsProps {
  farmerId: string;
}

const FarmerListings = ({ farmerId }: FarmerListingsProps) => {
  const [batches, setBatches] = useState<Tables<"herb_batches">[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBatches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("herb_batches")
      .select("*")
      .eq("farmer_id", farmerId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load batches.", variant: "destructive" });
    } else {
      setBatches(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBatches();
  }, [farmerId]);

  const handleDelete = async (id: string, batchCode: string) => {
    const { error } = await supabase.from("herb_batches").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete batch.", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: `Batch ${batchCode} has been removed.` });
      fetchBatches();
    }
  };

  if (loading) {
    return <p className="text-muted-foreground py-8 text-center">Loading your listings...</p>;
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
    <div className="space-y-4">
      {batches.map((batch) => (
        <div key={batch.id} className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row gap-4">
          <div className="flex gap-4 flex-1 min-w-0">
            {batch.image_url && (
              <img
                src={batch.image_url}
                alt={batch.herb_name}
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{batch.herb_name}</h3>
                <span className="text-xs text-muted-foreground italic">{batch.scientific_name}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>Batch: {batch.batch_code}</span>
                <span>Region: {batch.harvest_region}</span>
                <span>₹{batch.price}/{batch.unit}</span>
              </div>
              {batch.hash && (
                <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  SHA-256 sealed
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end shrink-0">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQR(showQR === batch.id ? null : batch.id)}
                className="gap-1"
              >
                <QrCode className="h-4 w-4" />
                QR
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(batch.id, batch.batch_code)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {showQR === batch.id && (
              <BatchQRCode batchCode={batch.batch_code} size={100} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FarmerListings;
