import { Link } from "react-router-dom";
import { ShieldCheck, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { HerbBatch } from "@/lib/herbs-data";

interface HerbCardProps {
  herb: HerbBatch;
}

const HerbCard = ({ herb }: HerbCardProps) => {
  return (
    <Link
      to={`/herb/${herb.id}`}
      className="group block rounded-lg overflow-hidden bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={herb.image}
          alt={herb.herbName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            {herb.herbName}
          </h3>
          {herb.integrityStatus === "verified" && (
            <ShieldCheck className="h-5 w-5 text-verified" />
          )}
        </div>
        <p className="text-xs text-muted-foreground italic">{herb.scientificName}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {herb.harvestRegion}
        </div>
        <div className="flex items-center justify-between pt-2">
          <Badge variant="secondary" className="text-xs">
            {herb.category}
          </Badge>
          <span className="font-heading font-bold text-primary">
            ₹{herb.price}/{herb.unit}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default HerbCard;
