import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Shield, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const navLinks = [
  { to: "/how-it-works", label: "How It Works" },
  { to: "/browse", label: "Browse Herbs" },
  { to: "/verify", label: "Verify" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, profile, role, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="AyurTrace" className="h-9 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {role === "farmer" && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/farmer/dashboard">
                      <LayoutDashboard className="h-4 w-4 mr-1" />
                      Dashboard
                    </Link>
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  {profile?.name || user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">
                    <Shield className="h-4 w-4" />
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-md hover:bg-secondary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-primary"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  {role === "farmer" && (
                    <Link
                      to="/farmer/dashboard"
                      className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <div className="flex gap-2 pt-3 border-t border-border mt-2">
                    <Button variant="ghost" className="flex-1" onClick={() => { signOut(); setIsOpen(false); }}>
                      <LogOut className="h-4 w-4 mr-1" />
                      Log Out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex gap-2 pt-3 border-t border-border mt-2">
                  <Button variant="ghost" className="flex-1" asChild>
                    <Link to="/login" onClick={() => setIsOpen(false)}>Log In</Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link to="/register" onClick={() => setIsOpen(false)}>Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
