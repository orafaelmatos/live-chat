import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import  { jwtDecode } from "jwt-decode";

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(email, password);
      const { access_token } = response;
      
      localStorage.setItem('token', access_token);
      const decoded: any = jwtDecode(access_token); // decode JWT
      const userData = {
        email,
        id: decoded.user_id, // now we store the user id
      };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.response?.data?.detail || "Invalid credentials",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      await authAPI.register(email, password);
      
      toast({
        title: "Registration successful!",
        description: "Please log in with your credentials.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.detail || "Failed to create account",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};