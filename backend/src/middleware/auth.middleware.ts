import { Request, Response, NextFunction, RequestHandler } from "express";
import { supabase } from "../config/database";
import { AuthenticatedRequest, SupabaseUser } from "../models";

export const authenticate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error,
    } = (await supabase.auth.getUser(token)) as {
      data: { user: SupabaseUser | null };
      error: any;
    };

    if (error || !user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", user.email)
      .single();

    if (userError || !userData) {
      res.status(401).json({ error: "User not found in database" });
      return;
    }

    (req as AuthenticatedRequest).user = {
      id: userData.id,
      email: user.email as string,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication failed" });
    return;
  }
};

export const requireAdmin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = (req as AuthenticatedRequest).user;
    const { data: userData, error } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", id)
      .single();

    if (error || !userData?.is_admin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Failed to verify admin status" });
    return;
  }
};

export const verifyOwnership = (resourceTable: string): RequestHandler => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const resourceId = req.params.id;
      const { id: userId } = (req as AuthenticatedRequest).user;

      const { data: resource, error } = await supabase
        .from(resourceTable)
        .select("author_id, user_id")
        .eq("id", resourceId)
        .single();

      if (error || !resource) {
        next(new Error("Resource not found"));
        return;
      }

      const ownerId = resource.author_id || resource.user_id;

      if (ownerId !== userId) {
        const { data: user } = await supabase
          .from("users")
          .select("is_admin")
          .eq("id", userId)
          .single();

        if (!user?.is_admin) {
          next(new Error("Unauthorized access"));
          return;
        }
      }

      next();
    } catch (error) {
      next(error);
      return;
    }
  };
};