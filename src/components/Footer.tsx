import { Link } from "react-router-dom";
import { Shield, Leaf, Mail } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-olive text-olive-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="AyurTrace" className="h-10 w-auto brightness-200" />
            </Link>
            <p className="text-sm opacity-80 leading-relaxed">
              Ensuring the authenticity and traceability of Ayurvedic herbs through cryptographic verification.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/browse" className="hover:opacity-100 transition-opacity">Browse Herbs</Link></li>
              <li><Link to="/verify" className="hover:opacity-100 transition-opacity">Verify Authenticity</Link></li>
              <li><Link to="/how-it-works" className="hover:opacity-100 transition-opacity">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:opacity-100 transition-opacity">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Trust</h4>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gold" />
                SHA-256 Verified
              </li>
              <li className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-gold" />
                AYUSH Compliant
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold" />
                support@ayurtrace.in
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-olive-foreground/20 mt-10 pt-6 text-center text-sm opacity-60">
          © {new Date().getFullYear()} AyurTrace. All rights reserved. No blockchain. No tokens. Just trust.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
