import { Link } from "react-router-dom";
import { ShieldCheck, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DbHerbBatch } from "@/hooks/useBrowseHerbs";

interface DbHerbCardProps {
  herb: DbHerbBatch;
}

const DbHerbCard = ({ herb }: DbHerbCardProps) => {
  return (
    <Link
      to={`/verify?batch=${herb.batch_code}`}
      className="group block rounded-lg overflow-hidden bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
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
  );
};

export default DbHerbCard;
