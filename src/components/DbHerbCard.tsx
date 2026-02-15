import { Link } from "react-router-dom";
import { memo } from "react";
import { ShieldCheck, MapPin, Heart, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/StarRating";
import type { DbHerbBatch } from "@/hooks/useBrowseHerbs";
import { useSavedHerbs } from "@/hooks/useSavedHerbs";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReviewSection from "@/components/ReviewSection";

interface DbHerbCardProps {
  herb: DbHerbBatch;
  rating?: { avg: number; count: number };
}

const DbHerbCard = ({ herb, rating }: DbHerbCardProps) => {
  const { savedIds, toggleSave, isToggling } = useSavedHerbs();
  const isSaved = savedIds.has(herb.id);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(herb.id);
  };

  const handleReviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="group block rounded-lg overflow-hidden bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative">
      <Link
        to={`/herb/${herb.id}`}
        className="block"
      >
        <button
          onClick={handleHeartClick}
          disabled={isToggling}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm hover:scale-110 active:scale-95 transition-all group/heart"
          aria-label={isSaved ? "Remove from saved" : "Save herb"}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              isSaved 
                ? "fill-destructive text-destructive" 
                : "text-muted-foreground group-hover/heart:text-destructive"
            )}
          />
        </button>

        <div className="aspect-square overflow-hidden bg-muted">
          {herb.image_url ? (
            <img
              src={herb.image_url}
              alt={herb.herb_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No Image
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold text-foreground truncate">
              {herb.herb_name}
            </h3>
            {herb.hash && <ShieldCheck className="h-5 w-5 text-verified shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground italic">{herb.scientific_name}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {herb.harvest_region}
          </div>
          
          <div className="flex items-center justify-between pt-1">
            {rating && rating.count > 0 ? (
              <div className="flex items-center gap-2">
                <StarRating avg={rating.avg} count={rating.count} />
                <Dialog>
                  <DialogTrigger asChild>
                    <button 
                      onClick={handleReviewClick}
                      className="text-[10px] flex items-center gap-1 text-primary hover:underline font-medium"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Read reviews
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        Reviews for {herb.herb_name}
                        <Badge variant="outline" className="font-mono text-[10px]">{herb.batch_code}</Badge>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <ReviewSection batchId={herb.id} />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Heart key={i} className="h-3 w-3 text-muted-foreground/20" />
                  ))}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button 
                      onClick={handleReviewClick}
                      className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      No reviews yet
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Reviews for {herb.herb_name}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <ReviewSection batchId={herb.id} />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            {herb.category && (
              <Badge variant="secondary" className="text-xs">
                {herb.category}
              </Badge>
            )}
            <span className="font-heading font-bold text-primary">
              ₹{herb.price}/{herb.unit}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default memo(DbHerbCard);
