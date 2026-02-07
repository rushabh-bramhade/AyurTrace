import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  userId: string;
  onUpload: (url: string) => void;
  currentUrl?: string;
}

const ImageUpload = ({ userId, onUpload, currentUrl }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("herb-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("herb-images")
        .getPublicUrl(fileName);

      onUpload(urlData.publicUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
          <img
            src={preview}
            alt="Herb preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
        >
          {uploading ? (
            <>
              <Upload className="h-8 w-8 animate-pulse" />
              <span className="text-sm">Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8" />
              <span className="text-sm">Click to upload herb image</span>
              <span className="text-xs">Max 5MB • JPG, PNG, WebP</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
