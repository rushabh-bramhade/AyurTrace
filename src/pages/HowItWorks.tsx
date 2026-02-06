import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserPlus, ClipboardCheck, FileCheck, QrCode, ScanLine,
  ShieldCheck, ArrowRight, Lock, Leaf, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const steps = [
  {
    icon: UserPlus,
    title: "1. Farmer Registration",
    description: "Farmers register on the platform with their identity, farm location, and certifications. Each profile undergoes admin verification before listing herbs.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: ClipboardCheck,
    title: "2. Herb Batch Submission",
    description: "Verified farmers submit detailed batch information: herb name, scientific name, harvest region, harvest date, ordered processing steps, and images of each stage.",
    color: "bg-gold/10 text-gold",
  },
  {
    icon: Lock,
    title: "3. Cryptographic Sealing",
    description: "The batch data is serialized into canonical JSON and processed through SHA-256 hashing. This creates a unique, irreversible fingerprint of the data that's permanently stored.",
    color: "bg-olive/10 text-olive",
  },
  {
    icon: QrCode,
    title: "4. QR Code Generation",
    description: "A unique QR code is generated for each batch, linking directly to its verification page. This QR code is printed on the product packaging.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: ScanLine,
    title: "5. Customer Scans QR",
    description: "Customers scan the QR code using any smartphone camera. No app download required — the verification page opens directly in their browser.",
    color: "bg-gold/10 text-gold",
  },
  {
    icon: ShieldCheck,
    title: "6. Instant Verification",
    description: "The system recomputes the SHA-256 hash from stored data and compares it with the original hash. If they match, integrity is confirmed. Any discrepancy triggers a tamper alert.",
    color: "bg-verified/10 text-verified",
  },
];

const HowItWorks = () => {
  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              How AyurTrace Works
            </h1>
            <p className="text-lg text-muted-foreground">
              A transparent, tamper-proof system that brings trust to every Ayurvedic herb — without blockchain, without tokens, just mathematics.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="flex gap-5 items-start"
              >
                <div className={`shrink-0 w-12 h-12 rounded-xl ${step.color} flex items-center justify-center`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-1">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Why SHA-256 */}
          <div className="max-w-3xl mx-auto mt-20">
            <div className="rounded-xl bg-card border border-border p-8">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Why SHA-256?
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  SHA-256 is a one-way cryptographic hash function used by banks, governments, and security systems worldwide. It produces a unique 64-character fingerprint from any data.
                </p>
                <p>
                  <strong className="text-foreground">Tamper-evident:</strong> Changing even a single character in the original data produces a completely different hash.
                </p>
                <p>
                  <strong className="text-foreground">Irreversible:</strong> You cannot reconstruct the original data from its hash, protecting farmer privacy.
                </p>
                <p>
                  <strong className="text-foreground">No blockchain needed:</strong> We store the hash in our secured database. The mathematical guarantee of integrity doesn't require distributed ledgers.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/verify">
                  <Eye className="h-4 w-4 mr-1" />
                  Try Verification
                </Link>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <Link to="/browse">
                  <Leaf className="h-4 w-4 mr-1" />
                  Browse Herbs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HowItWorks;
