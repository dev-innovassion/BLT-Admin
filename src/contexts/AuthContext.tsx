import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { AuthUser } from "@shared/schema";

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("currentUser");
      const token = localStorage.getItem("access_token");
      
      console.log('AuthContext init - storedUser:', storedUser);
      console.log('AuthContext init - token:', token ? 'exists' : 'missing');
      
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          console.log('Parsed stored user:', parsed);
          
          if (parsed && parsed.id && parsed.email && parsed.role) {
            setUser(parsed);
          } else {
            console.warn('Stored user data is incomplete, fetching fresh data...');
            localStorage.removeItem("currentUser");
            
            if (token) {
              const { backendAuthApi } = await import("@/lib/backendApi");
              const userData = await backendAuthApi.getCurrentUser(token);
              console.log('Fetched user data:', userData);
              setUser(userData);
              localStorage.setItem("currentUser", JSON.stringify(userData));
            }
          }
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem("currentUser");
          
          if (token) {
            try {
              const { backendAuthApi } = await import("@/lib/backendApi");
              const userData = await backendAuthApi.getCurrentUser(token);
              console.log('Fetched user data after parse error:', userData);
              setUser(userData);
              localStorage.setItem("currentUser", JSON.stringify(userData));
            } catch (fetchError) {
              console.error("Failed to fetch user profile:", fetchError);
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
            }
          }
        }
      } else if (token) {
        console.log('Fetching user profile with token...');
        try {
          const { backendAuthApi } = await import("@/lib/backendApi");
          const userData = await backendAuthApi.getCurrentUser(token);
          console.log('Fetched user data:', userData);
          setUser(userData);
          localStorage.setItem("currentUser", JSON.stringify(userData));
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
      
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const login = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        const { backendAuthApi } = await import("@/lib/backendApi");
        await backendAuthApi.logout(token);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {isLoading && !user ? null : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
