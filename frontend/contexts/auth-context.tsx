"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { User } from "@/lib/models/user";
import { AuthApi } from "@/lib/api/auth-api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  signUp: (
    email: string,
    password: string,
    username: string,
    fullName: string,
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authApi = new AuthApi();

  useEffect(() => {
    // Load saved auth state from localStorage on mount
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }

    setLoading(false);
  }, []);

  // Persist auth state to localStorage whenever it changes
  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user, token]);

  const signUp = async (
    email: string,
    password: string,
    username: string,
    fullName: string,
  ) => {
    setLoading(true);
    try {
      const newUser = await authApi.signUp(email, password, username, fullName);

      setUser(newUser);
      setToken(newUser.token ?? null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: loggedInUser, token: newToken } = await authApi.signIn(
        email,
        password,
      );

      setUser(loggedInUser);
      setToken(newToken);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await authApi.signOut(token);
      setUser(null);
      setToken(null);
      setError(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={useMemo(
        () => ({
          user,
          token,
          loading,
          error,
          signUp,
          signIn,
          signOut,
        }),
        [user, token, loading, error, signUp, signIn, signOut],
      )}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
