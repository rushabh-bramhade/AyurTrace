import { useState } from "react";
import { Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateHash } from "@/lib/hash-utils";
import ImageUpload from "./ImageUpload";
import CategorySelect from "./CategorySelect";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const batchSchema = z.object({
  herbName: z.string().trim().min(2, "Herb name is required").max(100),
  scientificName: z.string().trim().min(2, "Scientific name is required").max(150),
  farmerName: z.string().trim().min(2, "Farmer name is required").max(100),
  description: z.string().trim().max(1000).optional(),
  harvestRegion: z.string().trim().min(2, "Harvest region is required").max(200),
  harvestDate: z.string().min(1, "Harvest date is required"),
  price: z.number().positive("Price must be positive"),
  unit: z.string().trim().min(1, "Unit is required").max(50),
  category: z.string().trim().min(1, "Category is required").max(100),
  processingSteps: z.string().trim().max(2000).optional(),
});

interface AddHerbBatchFormProps {
  farmerId: string;
  initialFarmerName?: string;
  onSuccess: () => void;
}

const AddHerbBatchForm = ({ farmerId, initialFarmerName = "", onSuccess }: AddHerbBatchFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState("");
  const [form, setForm] = useState({
    herbName: "",
    scientificName: "",
    farmerName: initialFarmerName,
    description: "",
    harvestRegion: "",
    harvestDate: "",
    price: "",
    unit: "100g",
    category: "",
    processingSteps: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const createBatchMutation = useMutation({
    mutationFn: async () => {
      const priceNum = parseFloat(form.price);
      const validation = batchSchema.safeParse({
        ...form,
        price: isNaN(priceNum) ? 0 : priceNum,
      });

      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const validData = validation.data;
      const batchCode = `ATB-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      const steps = (form.processingSteps || "")
        .split("\n")
        .filter((s) => s.trim())
        .map((step) => ({
          step: step.trim(),
          date: validData.harvestDate,
          description: step.trim(),
        }));

      const dataForHash = {
        batchCode,
        herbName: validData.herbName,
        scientificName: validData.scientificName,
        farmerName: validData.farmerName,
        harvestRegion: validData.harvestRegion,
        harvestDate: validData.harvestDate,
        farmerId,
        processingSteps: steps.map((s) => s.step).join(","),
      };
      
      // Check if similar batch was recently added to prevent double-submit
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: existing } = await supabase
        .from("herb_batches")
        .select("id")
        .eq("farmer_id", farmerId)
        .eq("herb_name", validData.herbName)
        .eq("harvest_date", validData.harvestDate)
        .gte("created_at", fiveMinutesAgo)
        .maybeSingle();

      if (existing) {
        throw new Error("A similar batch was already registered recently.");
      }

      const hash = await generateHash(dataForHash);

      const { error } = await supabase.from("herb_batches").insert({
        batch_code: batchCode,
        farmer_id: farmerId,
        herb_name: validData.herbName,
        scientific_name: validData.scientificName,
        farmer_name: validData.farmerName,
        description: validData.description || null,
        harvest_region: validData.harvestRegion,
        harvest_date: validData.harvestDate,
        processing_steps: steps,
        price: validData.price,
        unit: validData.unit,
        hash,
        category: validData.category || null,
        image_url: imageUrl || null,
        status: "authentic",
      });

      if (error) throw error;
      return batchCode;
    },
    onSuccess: (batchCode) => {
      queryClient.invalidateQueries({ queryKey: ["herb_batches"] });
      toast({
        title: "Herb Batch Created!",
        description: `Batch ${batchCode} has been registered with SHA-256 verification.`,
      });

      setForm({
        herbName: "",
        scientificName: "",
        farmerName: initialFarmerName,
        description: "",
        harvestRegion: "",
        harvestDate: "",
        price: "",
        unit: "100g",
        category: "",
        processingSteps: "",
      });
      setImageUrl("");
      onSuccess();
    },
    onError: (error) => {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to create herb batch.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBatchMutation.mutate();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="bg-primary/5 border-b border-border p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Register New Herb Batch</h2>
              <p className="text-sm text-muted-foreground">Add a new harvest to your inventory for SHA-256 verification.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Herb Media</Label>
            <div className="bg-secondary/20 rounded-xl p-4 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
              <ImageUpload userId={farmerId} onUpload={setImageUrl} currentUrl={imageUrl || undefined} />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Basic Information</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="herbName" className="font-medium">Herb Name *</Label>
                <Input 
                  id="herbName" 
                  placeholder="e.g. Ashwagandha" 
                  className="bg-secondary/30 focus:bg-background transition-all border-border"
                  value={form.herbName} 
                  onChange={(e) => handleChange("herbName", e.target.value)} 
                  required 
                  disabled={createBatchMutation.isPending} 
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="scientificName" className="font-medium">Scientific Name *</Label>
                <Input 
                  id="scientificName" 
                  placeholder="e.g. Withania somnifera" 
                  className="bg-secondary/30 focus:bg-background transition-all border-border italic"
                  value={form.scientificName} 
                  onChange={(e) => handleChange("scientificName", e.target.value)} 
                  required 
                  disabled={createBatchMutation.isPending} 
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="farmerName" className="font-medium">Farmer Name *</Label>
              <Input 
                id="farmerName" 
                placeholder="Your full name or farm name" 
                className="bg-secondary/30 focus:bg-background transition-all border-border"
                value={form.farmerName} 
                onChange={(e) => handleChange("farmerName", e.target.value)} 
                required 
                disabled={createBatchMutation.isPending} 
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="description" className="font-medium">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe the herb batch, its quality, and key characteristics..." 
                className="bg-secondary/30 focus:bg-background transition-all border-border min-h-[120px]"
                value={form.description} 
                onChange={(e) => handleChange("description", e.target.value)} 
                disabled={createBatchMutation.isPending} 
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Harvest & Logistics</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="harvestRegion" className="font-medium">Harvest Region *</Label>
                <Input 
                  id="harvestRegion" 
                  placeholder="e.g. Mandsaur, MP" 
                  className="bg-secondary/30 focus:bg-background transition-all border-border"
                  value={form.harvestRegion} 
                  onChange={(e) => handleChange("harvestRegion", e.target.value)} 
                  required 
                  disabled={createBatchMutation.isPending} 
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="harvestDate" className="font-medium">Harvest Date *</Label>
                <Input 
                  id="harvestDate" 
                  type="date" 
                  className="bg-secondary/30 focus:bg-background transition-all border-border"
                  value={form.harvestDate} 
                  onChange={(e) => handleChange("harvestDate", e.target.value)} 
                  required 
                  disabled={createBatchMutation.isPending} 
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="price" className="font-medium">Price (₹) *</Label>
                <Input 
                  id="price" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="450" 
                  className="bg-secondary/30 focus:bg-background transition-all border-border"
                  value={form.price} 
                  onChange={(e) => handleChange("price", e.target.value)} 
                  required 
                  disabled={createBatchMutation.isPending} 
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="unit" className="font-medium">Unit *</Label>
                <Input 
                  id="unit" 
                  placeholder="e.g. 100g, kg" 
                  className="bg-secondary/30 focus:bg-background transition-all border-border"
                  value={form.unit} 
                  onChange={(e) => handleChange("unit", e.target.value)} 
                  required 
                  disabled={createBatchMutation.isPending} 
                />
              </div>
              <div className="space-y-2.5">
                <Label className="font-medium">Category *</Label>
                <CategorySelect 
                  value={form.category} 
                  onChange={(v) => handleChange("category", v)} 
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Processing Details</h3>
            <div className="space-y-2.5">
              <Label htmlFor="processingSteps" className="font-medium">Steps (One per line)</Label>
              <Textarea 
                id="processingSteps" 
                placeholder="Cleaning&#10;Drying&#10;Sorting" 
                className="bg-secondary/30 focus:bg-background transition-all border-border font-mono text-sm"
                value={form.processingSteps} 
                onChange={(e) => handleChange("processingSteps", e.target.value)} 
                rows={4} 
                disabled={createBatchMutation.isPending} 
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20" 
              disabled={createBatchMutation.isPending}
            >
              {createBatchMutation.isPending ? (
                <>
                  <Skeleton className="mr-2 h-5 w-5 rounded-full bg-white/30 animate-pulse" />
                  Registering Batch...
                </>
              ) : (
                "Register Batch & Generate QR"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHerbBatchForm;
