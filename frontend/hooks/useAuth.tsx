import { useState } from "react";

import { AuthApi } from "@/lib/api/auth-api";
import { User } from "@/lib/models/user";

interface UseAuthResult {
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

export const useAuth = (): UseAuthResult => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const authApi = new AuthApi();

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
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: loggedInUser, token } = await authApi.signIn(
        email,
        password,
      );

      setUser(loggedInUser);
      setToken(token);
      setError(null);
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    token,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };
};
