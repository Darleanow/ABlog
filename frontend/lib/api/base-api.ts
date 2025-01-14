import { HttpError } from "./types/http-error";

import { API_CONFIG } from "@/lib/config/api.config";

export class BaseApi {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  protected async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new HttpError(
        response.status,
        `API Error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }
}
