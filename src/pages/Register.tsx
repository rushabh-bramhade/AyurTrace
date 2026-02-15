import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["customer", "farmer"], { required_error: "Please select your role" }),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const { signUp, user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user && role) {
      // Role-based redirection even if they try to access /register while logged in
      if (role === "farmer") {
        navigate("/farmer-dashboard", { replace: true });
      } else if (role === "customer") {
        navigate("/customer-dashboard", { replace: true });
      } else if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, role, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.name,
      formData.role as "farmer" | "customer"
    );
    setIsSubmitting(false);

    if (error) {
      console.error("Registration error details:", error);
      let message = "An error occurred during registration.";
      if (error.message.includes("already registered") || error.message.includes("already been registered")) {
        message = "This email is already registered. Please log in instead.";
      } else if (error.message.includes("password")) {
        message = "Password must be at least 8 characters long.";
      } else if (error.message.toLowerCase().includes("rate limit") || error.message.toLowerCase().includes("too many requests") || error.message.includes("over_email_send_rate_limit")) {
        message = "Supabase email rate limit exceeded. Please try again in an hour or use one of the pre-confirmed test accounts.";
      } else if (error.message.includes("email_provider_disabled") || error.message.includes("Email signups are disabled")) {
        message = "Email signups are currently disabled in the Supabase project settings. Please enable them in Authentication > Providers.";
      } else {
        // Fallback to the actual error message if it's not one of the common ones
        message = error.message;
      }
      toast({ title: "Registration Failed", description: message, variant: "destructive" });
    } else {
      toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account before logging in.",
      });
      navigate("/login", { replace: true });
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4 max-w-md">
            <div className="text-center mb-8">
              <Skeleton className="h-16 w-16 mx-auto mb-4 rounded-full" />
              <Skeleton className="h-8 w-64 mx-auto mb-2" />
              <Skeleton className="h-4 w-72 mx-auto" />
            </div>
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-md">
          <div className="text-center mb-8">
            <img src={logo} alt="AyurTrace" className="h-16 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Create Your Account</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Join AyurTrace to verify or list authentic herbs
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>I am a</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer — I want to buy & verify herbs</SelectItem>
                  <SelectItem value="farmer">Farmer — I want to list & sell herbs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              <UserPlus className="h-4 w-4 mr-1" />
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Register;
