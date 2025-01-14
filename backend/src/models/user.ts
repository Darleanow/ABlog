import { TimestampedModel } from "./base";
import { AuthUserData } from "./auth";

interface UserBase extends TimestampedModel {
  username: string;
  email: string;
}

interface UserAuth {
  password_hash: string;
  is_admin: boolean;
}

export interface UserProfile {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
}

export interface User extends UserBase, UserAuth, UserProfile {}

export interface AuthUser {
  id: number;
  email: string;
}

export interface UpdateUserBody extends Partial<UserProfile> {}

export interface UserFollower {
  follower_id: number;
  following_id: number;
  created_at: string;
}

export interface UserWithCounts extends Omit<User, 'password_hash'> {
  followers: { count: number | null }[];
  following: { count: number | null }[];
  articles: { count: number | null }[];
}

export interface UserResponse extends Omit<User, 'password_hash'> {
  followers_count: number;
  following_count: number;
  articles_count: number;
  auth: AuthUserData | null;
}

export interface AuthorInfo {
  username: string;
  full_name?: string;
  avatar_url?: string;
}