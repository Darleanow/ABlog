import { API_CONFIG } from "../config/api.config";
import { User } from "../models/user";

export class AuthRepository {
  async signUp(
    email: string,
    password: string,
    username: string,
    fullName: string,
  ): Promise<User> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.signUp}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          username,
          full_name: fullName,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.error || "Failed to sign up");
    }

    return response.json();
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.signIn}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
    );

    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.error || "Failed to sign in");
    }

    return response.json();
  }

  async signOut(token: string): Promise<void> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.signOut}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.error || "Failed to sign out");
    }
  }
}
