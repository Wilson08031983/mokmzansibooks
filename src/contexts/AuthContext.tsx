
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  subscriptionStatus?: "trial" | "active" | "inactive";
  trialEndsAt?: Date;
  provider?: "email" | "google";
}

interface AuthContextType {
  currentUser: User | null;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("mokmzansiUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Mock sign-in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // For demo purposes, create a mock user
      const user: User = {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        subscriptionStatus: "trial",
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        provider: "email"
      };
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem("mokmzansiUser", JSON.stringify(user));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock sign-up function
  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // For demo purposes, create a mock user
      const user: User = {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        email,
        name,
        subscriptionStatus: "trial",
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        provider: "email"
      };
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem("mokmzansiUser", JSON.stringify(user));
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock Google sign-in function
  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Generate random email and name to simulate Google login
      const randomId = Math.random().toString(36).substring(2, 10);
      const randomName = ["John Smith", "Jane Doe", "Alex Johnson", "Sam Williams", "Taylor Brown"][Math.floor(Math.random() * 5)];
      const randomEmail = `${randomName.toLowerCase().replace(" ", ".")}${randomId}@gmail.com`;
      
      // For demo purposes, create a mock user
      const user: User = {
        id: "google-user-" + randomId,
        email: randomEmail,
        name: randomName,
        subscriptionStatus: "trial",
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        provider: "google"
      };
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem("mokmzansiUser", JSON.stringify(user));
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock sign-out function
  const signOut = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("mokmzansiUser");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
