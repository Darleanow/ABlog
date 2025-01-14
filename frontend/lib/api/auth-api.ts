import { User } from "../models/user";
import { API_CONFIG } from "../config/api.config";

import { BaseApi } from "./base-api";

export class AuthApi extends BaseApi {
  async signUp(
    email: string,
    password: string,
    username: string,
    fullName: string,
  ): Promise<User> {
    try {
      return await this.fetchApi<User>(API_CONFIG.endpoints.auth.signUp, {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          username,
          full_name: fullName,
        }),
      });
    } catch (error: any) {
      // Enhance error message for email verification
      if (error.status === 400) {
        throw new Error("Please check your email to verify your account");
      }
      throw error;
    }
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }> {
    try {
      return await this.fetchApi<{ user: User; token: string }>(
        API_CONFIG.endpoints.auth.signIn,
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
      );
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error("Invalid email or password");
      }
      throw error;
    }
  }

  async signOut(token: string): Promise<void> {
    if (!token) {
      throw new Error("No authentication token available");
    }

    return this.fetchApi<void>(API_CONFIG.endpoints.auth.signOut, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
