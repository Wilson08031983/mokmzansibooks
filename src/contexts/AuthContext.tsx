
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  subscriptionStatus?: "trial" | "active" | "inactive";
  trialEndsAt?: Date;
  provider?: "email" | "google";
}

interface AuthContextType {
  currentUser: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setIsAuthenticated(!!currentSession);
        
        if (currentSession?.user) {
          const user = currentSession.user;
          
          // Get the provider from user metadata
          const providerValue = user.app_metadata?.provider;
          // Ensure provider is either "email" or "google"
          const provider = providerValue === "google" ? "google" : "email";
          
          // Create user profile from Supabase user
          const userProfile: UserProfile = {
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.name || user.email?.split('@')[0] || "",
            subscriptionStatus: "trial", // Default to trial for new users
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            provider: provider
          };
          
          setCurrentUser(userProfile);
        } else {
          setCurrentUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    const checkSession = async () => {
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (!existingSession) {
        setIsLoading(false);
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Failed to sign in. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account created",
        description: "Please check your email to confirm your account.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Google sign in failed",
        description: error.message || "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
