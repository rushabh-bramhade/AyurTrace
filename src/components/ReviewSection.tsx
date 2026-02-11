import { useState, useEffect } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("batch_id", batchId)
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch user names
      const userIds = [...new Set(data.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", userIds);

      const nameMap = new Map(profiles?.map((p) => [p.user_id, p.name]) || []);
      const enriched = data.map((r) => ({ ...r, user_name: nameMap.get(r.user_id) || "Anonymous" }));
      setReviews(enriched);
      if (user) setHasReviewed(data.some((r) => r.user_id === user.id));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [batchId]);

  const handleSubmit = async () => {
    if (!user || newRating === 0) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      batch_id: batchId,
      user_id: user.id,
      rating: newRating,
      comment: newComment.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review Submitted!" });
      setNewRating(0);
      setNewComment("");
      fetchReviews();
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

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
      {user && role === "customer" && !hasReviewed && (
        <div className="border-t border-border pt-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Leave a Review</p>
          <StarRating rating={newRating} onRate={setNewRating} interactive />
          <Textarea
            placeholder="Share your experience with this herb..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button size="sm" onClick={handleSubmit} disabled={submitting || newRating === 0} className="gap-1">
            <Send className="h-4 w-4" />
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      )}

      {hasReviewed && (
        <p className="text-sm text-muted-foreground italic border-t border-border pt-3">
          You've already reviewed this herb batch.
        </p>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
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
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
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
