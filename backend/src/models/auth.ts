import { Request } from "express";
import { AuthUser } from "./user";

interface SupabaseMetadata {
  [key: string]: any;
}

interface SupabaseAuthMeta {
  provider?: string;
  [key: string]: any;
}

export interface SupabaseUser {
  id: string;
  email?: string;
  phone?: string;
  app_metadata: SupabaseAuthMeta;
  user_metadata: SupabaseMetadata;
  aud: string;
  created_at: string;
  last_sign_in_at?: string;
}

export interface AuthUserData {
  id: string;
  provider?: string;
  last_sign_in?: string;
  created_at: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}