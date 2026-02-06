import Layout from "@/components/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl prose prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground">
          <h1>Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: February 2026</p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly, such as your name, email address, and farm details
            when you register as a farmer. For customers, we collect order and verification activity data.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            Your data is used to provide herb traceability services, verify farmer identities, process
            orders, and generate cryptographic hashes for batch verification. We never sell your data.
          </p>

          <h2>3. Data Integrity</h2>
          <p>
            Herb batch data used for SHA-256 hash generation is stored immutably after hash creation.
            This data cannot be edited to maintain cryptographic integrity.
          </p>

          <h2>4. Payment Information</h2>
          <p>
            Payment processing is handled by Razorpay. We do not store credit card numbers or
            sensitive financial data on our servers. All transactions are RBI-compliant.
          </p>

          <h2>5. Data Security</h2>
          <p>
            We implement industry-standard security measures including encrypted data transmission,
            secure authentication, and regular security audits.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            For privacy-related inquiries, contact us at privacy@ayurtrace.in.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
