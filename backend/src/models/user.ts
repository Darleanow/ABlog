import { TimestampedModel } from "./base";

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

export interface AuthorInfo {
  username: string;
  full_name?: string;
  avatar_url?: string;
}
