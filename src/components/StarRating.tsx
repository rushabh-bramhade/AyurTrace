import { Star } from "lucide-react";

interface StarRatingProps {
  avg: number;
  count: number;
}

const StarRating = ({ avg, count }: StarRatingProps) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i <= Math.round(avg)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {avg.toFixed(1)} ({count})
      </span>
    </div>
  );
};

export default StarRating;
