import { useState } from "react";
import { Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateHash } from "@/lib/hash-utils";
import { z } from "zod";

const batchSchema = z.object({
  herbName: z.string().trim().min(2, "Herb name is required").max(100),
  scientificName: z.string().trim().min(2, "Scientific name is required").max(150),
  description: z.string().trim().max(1000).optional(),
  harvestRegion: z.string().trim().min(2, "Harvest region is required").max(200),
  harvestDate: z.string().min(1, "Harvest date is required"),
  price: z.number().positive("Price must be positive"),
  unit: z.string().trim().min(1, "Unit is required").max(50),
  category: z.string().trim().max(100).optional(),
  processingSteps: z.string().trim().max(2000).optional(),
});

interface AddHerbBatchFormProps {
  farmerId: string;
  onSuccess: () => void;
}

const AddHerbBatchForm = ({ farmerId, onSuccess }: AddHerbBatchFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    herbName: "",
    scientificName: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = batchSchema.safeParse({
      ...form,
      price: parseFloat(form.price) || 0,
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate batch code
      const batchCode = `ATB-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      // Parse processing steps
      const steps = form.processingSteps
        .split("\n")
        .filter((s) => s.trim())
        .map((step, i) => ({
          step: step.trim(),
          date: form.harvestDate,
          description: step.trim(),
        }));

      // Compute hash for integrity
      const dataForHash = {
        batchCode,
        herbName: form.herbName,
        scientificName: form.scientificName,
        harvestRegion: form.harvestRegion,
        harvestDate: form.harvestDate,
        farmerId,
        processingSteps: steps.map((s) => s.step).join(","),
      };
      const hash = await generateHash(dataForHash);

      const { error } = await supabase.from("herb_batches").insert({
        batch_code: batchCode,
        farmer_id: farmerId,
        herb_name: form.herbName,
        scientific_name: form.scientificName,
        description: form.description || null,
        harvest_region: form.harvestRegion,
        harvest_date: form.harvestDate,
        processing_steps: steps,
        price: parseFloat(form.price),
        unit: form.unit,
        hash,
        category: form.category || null,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Herb Batch Created!",
        description: `Batch ${batchCode} has been registered with SHA-256 verification.`,
      });

      setForm({
        herbName: "",
        scientificName: "",
        description: "",
        harvestRegion: "",
        harvestDate: "",
        price: "",
        unit: "100g",
        category: "",
        processingSteps: "",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create herb batch.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-card rounded-xl border border-border p-6 space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Leaf className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Add New Herb Batch</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="herbName">Herb Name *</Label>
          <Input id="herbName" placeholder="e.g. Ashwagandha" value={form.herbName} onChange={(e) => handleChange("herbName", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scientificName">Scientific Name *</Label>
          <Input id="scientificName" placeholder="e.g. Withania somnifera" value={form.scientificName} onChange={(e) => handleChange("scientificName", e.target.value)} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="Describe the herb batch, its quality, and key characteristics..." value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="harvestRegion">Harvest Region *</Label>
          <Input id="harvestRegion" placeholder="e.g. Mandsaur, Madhya Pradesh" value={form.harvestRegion} onChange={(e) => handleChange("harvestRegion", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="harvestDate">Harvest Date *</Label>
          <Input id="harvestDate" type="date" value={form.harvestDate} onChange={(e) => handleChange("harvestDate", e.target.value)} required />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹) *</Label>
          <Input id="price" type="number" min="0" step="0.01" placeholder="450" value={form.price} onChange={(e) => handleChange("price", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Input id="unit" placeholder="e.g. 250g" value={form.unit} onChange={(e) => handleChange("unit", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" placeholder="e.g. Adaptogen" value={form.category} onChange={(e) => handleChange("category", e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="processingSteps">Processing Steps (one per line)</Label>
        <Textarea
          id="processingSteps"
          placeholder={"Harvesting - roots hand-harvested\nWashing & Sorting\nSun Drying for 5 days\nQuality Testing\nPackaging"}
          value={form.processingSteps}
          onChange={(e) => handleChange("processingSteps", e.target.value)}
          rows={5}
        />
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
        <Leaf className="h-4 w-4 mr-1" />
        {isSubmitting ? "Registering Batch..." : "Register Herb Batch"}
      </Button>
    </form>
  );
};

export default AddHerbBatchForm;
