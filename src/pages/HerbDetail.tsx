import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, User, ShieldCheck, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import VerificationStatus from "@/components/VerificationStatus";
import { getHerbById } from "@/lib/herbs-data";

const HerbDetail = () => {
  const { id } = useParams<{ id: string }>();
  const herb = getHerbById(id || "");

  if (!herb) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Herb Batch Not Found</h1>
          <p className="text-muted-foreground mb-6">The batch ID you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/browse">Browse Herbs</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/browse">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Browse
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-xl overflow-hidden border border-border">
              <img
                src={herb.image}
                alt={herb.herbName}
                className="w-full aspect-square object-cover"
              />
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary">{herb.category}</Badge>
                <Badge className="bg-verified text-verified-foreground">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {herb.herbName}
              </h1>
              <p className="text-muted-foreground italic mt-1">{herb.scientificName}</p>
            </div>

            <p className="text-foreground/80 leading-relaxed">{herb.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-muted-foreground">Origin: </span>
                  <span className="text-foreground font-medium">{herb.harvestRegion}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-muted-foreground">Harvested: </span>
                  <span className="text-foreground font-medium">{herb.harvestDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-muted-foreground">Farmer: </span>
                  <span className="text-foreground font-medium">{herb.farmer.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <QrCode className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-muted-foreground">Batch: </span>
                  <span className="text-foreground font-medium font-mono">{herb.id}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
              <div>
                <span className="text-sm text-muted-foreground">Price</span>
                <div className="text-2xl font-heading font-bold text-primary">
                  ₹{herb.price}
                  <span className="text-sm font-body text-muted-foreground ml-1">
                    / {herb.unit}
                  </span>
                </div>
              </div>
              <Button variant="gold" size="lg">
                Add to Cart
              </Button>
            </div>

            <VerificationStatus status={herb.integrityStatus} hash={herb.hash} />
          </motion.div>
        </div>

        {/* Processing Timeline */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-8">Processing Timeline</h2>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border" />
            {herb.processingSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`relative flex flex-col md:flex-row items-start md:items-center gap-4 mb-8 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? "md:text-right md:pr-10" : "md:text-left md:pl-10"} pl-10 md:pl-0`}>
                  <div className="bg-card rounded-lg p-4 border border-border inline-block text-left">
                    <div className="font-heading font-semibold text-foreground">{step.step}</div>
                    <div className="text-xs text-muted-foreground mt-1">{step.date}</div>
                    <p className="text-sm text-foreground/80 mt-2">{step.description}</p>
                  </div>
                </div>
                <div className="absolute left-2.5 md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HerbDetail;
