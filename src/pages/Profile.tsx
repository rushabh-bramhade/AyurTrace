import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  ChevronRight,
  Settings,
  Bell,
  Heart,
  History,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const { user, profile, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [region, setRegion] = useState(profile?.region || "");
  const [saving, setSaving] = useState(false);
  
  const [stats, setStats] = useState({
    savedCount: 0,
    historyCount: 0,
    authenticRate: 100
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setRegion(profile.region || "");
    }
  }, [profile]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      const { count: savedCount } = await supabase
        .from("saved_herbs")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);
        
      const { data: historyData } = await supabase
        .from("verification_history")
        .select("status")
        .eq("user_id", user.id);
        
      if (historyData) {
        const authentic = historyData.filter(h => h.status === 'authentic').length;
        setStats({
          savedCount: savedCount || 0,
          historyCount: historyData.length,
          authenticRate: historyData.length > 0 
            ? Math.round((authentic / historyData.length) * 100) 
            : 100
        });
      }
    };
    
    fetchStats();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        region,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);
      
    setSaving(false);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully."
      });
      setIsEditing(false);
    }
  };

  if (loading || !user || !profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 space-y-6">
              <Skeleton className="h-48 w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 space-y-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl mx-auto mb-4">
                  {profile.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </div>
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
                <Badge variant="secondary" className="capitalize">
                  {role} Account
                </Badge>
              </CardContent>
            </Card>
            
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-3 text-foreground" onClick={() => navigate('/browse')}>
                <Heart className="h-4 w-4" />
                Saved Herbs
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-foreground">
                <Settings className="h-4 w-4" />
                Account Settings
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Manage your personal details</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      disabled={!isEditing} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={user.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region / Location</Label>
                    <Input 
                      id="region" 
                      value={region} 
                      onChange={(e) => setRegion(e.target.value)} 
                      disabled={!isEditing} 
                      placeholder="e.g. Kerala, India"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {isEditing && (
                  <Button className="w-full mt-4" onClick={handleUpdateProfile} disabled={saving}>
                    {saving ? "Saving Changes..." : "Save Changes"}
                  </Button>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Saved Herbs</CardDescription>
                  <CardTitle className="text-2xl">{stats.savedCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Verifications</CardDescription>
                  <CardTitle className="text-2xl">{stats.historyCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Authenticity</CardDescription>
                  <CardTitle className="text-2xl">{stats.authenticRate}%</CardTitle>
                </CardHeader>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest interactions with the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Activity tracking coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
