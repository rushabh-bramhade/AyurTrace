import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Leaf, QrCode, ArrowRight, ShieldCheck, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import HerbCard from "@/components/HerbCard";
import { herbBatches } from "@/lib/herbs-data";
import heroImage from "@/assets/hero-herbs.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const Index = () => {
  const featuredHerbs = herbBatches.slice(0, 3);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Ayurvedic herbs"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <ShieldCheck className="h-4 w-4" />
              SHA-256 Cryptographic Verification
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-6xl font-bold leading-tight text-foreground mb-6"
            >
              Trust Every Herb.{" "}
              <span className="text-primary">Trace Every Root.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto"
            >
              AyurTrace ensures the authenticity of Ayurvedic herbs through tamper-evident
              QR-code traceability — from harvest to your hands.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/browse">
                  Browse Herbs
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <Link to="/verify">
                  <QrCode className="h-4 w-4 mr-1" />
                  Verify a Batch
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Verified Batches" },
              { value: "120+", label: "Registered Farmers" },
              { value: "99.9%", label: "Integrity Rate" },
              { value: "15+", label: "Herb Varieties" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-heading text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How AyurTrace Protects You
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A simple yet powerful system ensuring every herb you receive is genuine.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: "Farmer-Registered Origins",
                description: "Every herb batch is registered by verified farmers with complete harvest and processing data.",
              },
              {
                icon: Shield,
                title: "Cryptographic Hashing",
                description: "Batch data is sealed with SHA-256 hashing. Any alteration is immediately detectable.",
              },
              {
                icon: Eye,
                title: "Instant QR Verification",
                description: "Scan the QR code on any product to instantly verify its authenticity and full provenance chain.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              From Farm to Verification in 4 Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Farmer Registers", desc: "Verified farmers submit herb batch details including origin and processing." },
              { step: "02", title: "Data Sealed", desc: "A SHA-256 hash is generated from the batch data, creating a tamper-proof seal." },
              { step: "03", title: "QR Generated", desc: "A unique QR code linking to the verification page is created for each batch." },
              { step: "04", title: "You Verify", desc: "Scan the QR code to instantly check authenticity and view full provenance." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground font-heading text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="heroOutline" asChild>
              <Link to="/how-it-works">
                Learn More
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Herbs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Featured Herbs
              </h2>
              <p className="text-muted-foreground mt-2">
                Browse verified Ayurvedic herbs with full traceability.
              </p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link to="/browse">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredHerbs.map((herb) => (
              <HerbCard key={herb.id} herb={herb} />
            ))}
          </div>

          <div className="sm:hidden text-center mt-6">
            <Button variant="outline" asChild>
              <Link to="/browse">View All Herbs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-olive text-olive-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Are You an Ayurvedic Herb Farmer?
          </h2>
          <p className="text-lg opacity-80 max-w-xl mx-auto mb-8">
            Register your farm and start listing your herbs with cryptographic authenticity
            verification. Build trust with every customer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gold" size="lg" asChild>
              <Link to="/register">
                <Users className="h-4 w-4 mr-1" />
                Register as Farmer
              </Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="bg-olive-foreground/10 text-olive-foreground border border-olive-foreground/20 hover:bg-olive-foreground/20"
            >
              <Link to="/how-it-works">Learn How It Works</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
