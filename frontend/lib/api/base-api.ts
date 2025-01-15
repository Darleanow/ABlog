import { API_CONFIG } from "../config/api.config";

export abstract class BaseApi {
  protected readonly baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  protected getAuthToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  }

  protected async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.getAuthToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData.message ||
            `API Error: ${response.status} ${response.statusText}`,
        );
      }

      return response.json();
    } catch (error) {
      throw error instanceof Error ? error : new Error("Unknown API error");
    }
  }
}
