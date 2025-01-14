import { Response } from "express";
import { supabase, supabaseAdmin } from "../config/database";
import {
  AuthenticatedRequest,
  SupabaseUser,
  AuthUserData,
  UserResponse,
  UserWithCounts,
} from "../models";

export class UserController {
  async getUserById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const { data: dbUser, error: dbError } = (await supabase
        .from("users")
        .select(
          `
              id,
              username,
              email,
              full_name,
              bio,
              avatar_url,
              is_admin,
              created_at,
              updated_at,
              followers:user_followers!user_followers_following_id_fkey(count),
              following:user_followers!user_followers_follower_id_fkey(count),
              articles:articles!articles_author_id_fkey(count)
            `
        )
        .eq("id", id)
        .single()) as { data: UserWithCounts | null; error: any };

      if (dbError) throw dbError;
      if (!dbUser) return res.status(404).json({ error: "User not found" });

      let authUser: AuthUserData | null = null;
      if (supabaseAdmin) {
        const {
          data: { user },
          error: authError,
        } = (await supabaseAdmin.auth.admin.getUserById(dbUser.email)) as {
          data: { user: SupabaseUser | null };
          error: any;
        };

        if (!authError && user) {
          authUser = {
            id: user.id,
            provider: user.app_metadata.provider,
            last_sign_in: user.last_sign_in_at,
            created_at: user.created_at,
          };
        }
      }

      const { followers, following, articles, ...userFields } = dbUser;

      const userData: UserResponse = {
        ...userFields,
        followers_count: followers?.[0]?.count ?? 0,
        following_count: following?.[0]?.count ?? 0,
        articles_count: articles?.[0]?.count ?? 0,
        auth: authUser,
      };

      return res.json(userData);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getUserByEmail(req: AuthenticatedRequest, res: Response) {
    try {
      const { email } = req.params;

      const { data: dbUser, error: dbError } = (await supabase
        .from("users")
        .select(
          `
          id,
          username,
          email,
          full_name,
          bio,
          avatar_url,
          is_admin,
          created_at,
          updated_at,
          followers:user_followers!user_followers_following_id_fkey(count),
          following:user_followers!user_followers_follower_id_fkey(count),
          articles:articles!articles_author_id_fkey(count)
        `
        )
        .eq("email", email)
        .single()) as { data: UserWithCounts | null; error: any };

      if (dbError) throw dbError;
      if (!dbUser) return res.status(404).json({ error: "User not found" });

      let authUser: AuthUserData | null = null;
      if (supabaseAdmin) {
        const {
          data: { user },
          error: authError,
        } = (await supabaseAdmin.auth.admin.getUserById(email)) as {
          data: { user: SupabaseUser | null };
          error: any;
        };

        if (!authError && user) {
          authUser = {
            id: user.id,
            provider: user.app_metadata.provider,
            last_sign_in: user.last_sign_in_at,
            created_at: user.created_at,
          };
        }
      }

      const { followers, following, articles, ...userFields } = dbUser;

      const userData: UserResponse = {
        ...userFields,
        followers_count: followers?.[0]?.count ?? 0,
        following_count: following?.[0]?.count ?? 0,
        articles_count: articles?.[0]?.count ?? 0,
        auth: authUser,
      };

      return res.json(userData);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
