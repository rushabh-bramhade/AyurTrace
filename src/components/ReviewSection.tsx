import { useState } from "react";
import { Star, Send, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  user_name?: string;
}

interface ReviewSectionProps {
  batchId: string;
}

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"} ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
        onClick={() => interactive && onRate?.(i)}
      />
    ))}
  </div>
);

const ReviewSection = ({ batchId }: ReviewSectionProps) => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: reviews = [], isLoading: loading } = useQuery({
    queryKey: ["reviews", batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("batch_id", batchId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return [];

      // Fetch user names
      const userIds = [...new Set(data.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", userIds);

      const nameMap = new Map(profiles?.map((p) => [p.user_id, p.name]) || []);
      return data.map((r) => ({ ...r, user_name: nameMap.get(r.user_id) || "Anonymous" })) as Review[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user || newRating === 0) return;
      
      if (editingId) {
        const { error } = await supabase
          .from("reviews")
          .update({
            rating: newRating,
            comment: newComment.trim() || null,
          })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        // Double check if user already reviewed before inserting
        const { data: existingReview } = await supabase
          .from("reviews")
          .select("id")
          .eq("batch_id", batchId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (existingReview) {
          throw new Error("You have already reviewed this batch.");
        }

        const { error } = await supabase.from("reviews").insert({
          batch_id: batchId,
          user_id: user.id,
          rating: newRating,
          comment: newComment.trim() || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", batchId] });
      queryClient.invalidateQueries({ queryKey: ["average_ratings"] });
      toast({ title: editingId ? "Review Updated!" : "Review Submitted!" });
      setNewRating(0);
      setNewComment("");
      setEditingId(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", batchId] });
      queryClient.invalidateQueries({ queryKey: ["average_ratings"] });
      toast({ title: "Review Deleted" });
    },
    onError: (error) => {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    },
  });

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setNewRating(review.rating);
    setNewComment(review.comment || "");
    // Scroll to form
    const form = document.getElementById("review-form");
    form?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    deleteMutation.mutate(reviewId);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const hasReviewed = reviews.some((r) => r.user_id === user?.id);

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-foreground">Reviews</h3>
        {avgRating && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(Number(avgRating))} />
            <span className="text-sm text-muted-foreground">{avgRating} ({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Submit review form */}
      {user && role === "customer" && (!hasReviewed || editingId) && (
        <div id="review-form" className="border-t border-border pt-4 space-y-3 scroll-mt-20">
          <p className="text-sm font-medium text-foreground">
            {editingId ? "Edit Your Review" : "Leave a Review"}
          </p>
          <StarRating rating={newRating} onRate={setNewRating} interactive />
          <Textarea
            placeholder="Share your experience with this herb..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            disabled={submitMutation.isPending}
          />
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => submitMutation.mutate()} 
              disabled={submitMutation.isPending || newRating === 0} 
              className="gap-1"
            >
              {submitMutation.isPending ? <Skeleton className="h-4 w-4 rounded-full bg-white/30 animate-pulse" /> : <Send className="h-4 w-4" />}
              {submitMutation.isPending ? "Submitting..." : editingId ? "Update Review" : "Submit Review"}
            </Button>
            {editingId && (
              <Button size="sm" variant="outline" onClick={() => {
                setEditingId(null);
                setNewRating(0);
                setNewComment("");
              }} disabled={submitMutation.isPending}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {hasReviewed && !editingId && (
        <p className="text-sm text-muted-foreground italic border-t border-border pt-3">
          You've already reviewed this herb batch.
        </p>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4 border-t border-border pt-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4 border-t border-border pt-4">
          {reviews.map((review) => (
            <div key={review.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{review.user_name}</span>
                  <StarRating rating={review.rating} />
                </div>
                <div className="flex items-center gap-3">
                  {user?.id === review.user_id && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(review)}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                        disabled={submitMutation.isPending || deleteMutation.isPending}
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="text-xs text-destructive hover:underline flex items-center gap-1"
                        disabled={submitMutation.isPending || deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-foreground/80">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
