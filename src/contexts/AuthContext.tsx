import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Profile {
  id: string;
  name: string;
  email: string;
  region: string | null;
  certifications: string | null;
  approved: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: AppRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ error: Error | null }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Use refs to avoid closure issues in auth listeners
  const profileRef = useRef<Profile | null>(null);
  const userRef = useRef<User | null>(null);

  // Update refs whenever state changes
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const fetchUserData = async (userId: string) => {
    // Add a timeout to prevent hanging forever
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Auth data fetch timeout")), 10000)
    );

    try {
      const fetchDataPromise = Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
      ]);

      const [profileRes, roleRes] = await Promise.race([
        fetchDataPromise,
        timeoutPromise,
      ]) as [{ data: Profile | null; error: { message: string } | null }, { data: { role: AppRole } | null; error: { message: string } | null }];

      if (profileRes.error) {
        console.warn("Profile fetch error:", profileRes.error.message);
      } else if (profileRes.data) {
        setProfile(profileRes.data as Profile);
      }

      if (roleRes.error) {
        console.warn("Role fetch error:", roleRes.error.message);
      } else if (roleRes.data) {
        setRole(roleRes.data.role);
      }
    } catch (error) {
      console.error("Critical error in fetchUserData:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let initialCheckDone = false;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!mounted || initialCheckDone) return;

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          await fetchUserData(session.user.id);
        } else {
          setLoading(false);
        }
        initialCheckDone = true;
      } catch (error) {
        console.error("Auth initialization failed:", error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setLoading(false);
          initialCheckDone = true;
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log("Auth state change event:", event);
        const currentUser = session?.user ?? null;
        
        // Always update session/user state
        setSession(session);
        setUser(currentUser);

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          if (currentUser) {
            // ONLY set loading if we don't already have a user/profile in refs
            // This is the key fix for tab switching/focus reloads
            if (!userRef.current || !profileRef.current) {
              setLoading(true);
              await fetchUserData(currentUser.id);
            }
          } else {
            setLoading(false);
          }
          initialCheckDone = true;
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setProfile(null);
          setRole(null);
          setLoading(false);
          initialCheckDone = true;
        } else if (event === 'TOKEN_REFRESHED') {
          if (currentUser && !profileRef.current) {
            await fetchUserData(currentUser.id);
          }
        } else {
          if (!currentUser) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string, role: AppRole) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name, role },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Manually clear any leftover supabase items from storage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      setProfile(null);
      setRole(null);
      setUser(null);
      setSession(null);
      window.location.href = "/"; // Force a full page reload to clear all memory states
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const resendVerification = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, role, loading, signUp, signIn, signOut, resendVerification }}>
      {children}
    </AuthContext.Provider>
  );
}
