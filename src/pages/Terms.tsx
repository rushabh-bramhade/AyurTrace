import Layout from "@/components/Layout";

const Terms = () => {
  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl prose prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground">
          <h1>Terms & Conditions</h1>
          <p className="text-sm text-muted-foreground">Last updated: February 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using AyurTrace, you agree to be bound by these terms. If you do not
            agree, please do not use the platform.
          </p>

          <h2>2. Platform Purpose</h2>
          <p>
            AyurTrace provides traceability and authenticity verification for Ayurvedic herbs.
            The platform does not use blockchain, tokens, NFTs, or cryptocurrency.
          </p>

          <h2>3. Farmer Obligations</h2>
          <p>
            Farmers must provide accurate information about their herbs, including origin, harvest
            dates, and processing steps. Submitting false information will result in account suspension.
          </p>

          <h2>4. Data Immutability</h2>
          <p>
            Once a herb batch is submitted and its SHA-256 hash is generated, the batch data cannot
            be edited. This ensures the integrity of the verification system.
          </p>

          <h2>5. Payments</h2>
          <p>
            All payments are processed through Razorpay in compliance with RBI regulations.
            Refund policies are subject to individual order terms.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            AyurTrace provides verification technology only. We are not responsible for the
            quality or efficacy of herbs listed by farmers on the platform.
          </p>

          <h2>7. Contact</h2>
          <p>
            For questions about these terms, contact us at legal@ayurtrace.in.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Terms;
