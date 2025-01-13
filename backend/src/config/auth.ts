import { Response, NextFunction } from "express";
import { supabase } from "./database";
import { AuthenticatedRequest, SupabaseUser } from "../models/types";

// Middleware to verify JWT token from Authorization header
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify the JWT token with Supabase
    const {
      data: { user },
      error,
    } = (await supabase.auth.getUser(token)) as {
      data: { user: SupabaseUser | null };
      error: any;
    };

    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Get user data from our users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", user.email)
      .single();

    if (userError || !userData) {
      return res.status(401).json({ error: "User not found in database" });
    }

    // Add user to request object
    req.user = {
      id: userData.id,
      email: user.email as string,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" });
  }
};

// Middleware to check if user is an admin
export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const { data: userData, error } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", req.user.id)
      .single();

    if (error || !userData?.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: "Failed to verify admin status" });
  }
};
