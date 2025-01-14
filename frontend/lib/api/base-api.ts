import { API_CONFIG } from "../config/api.config";

import { HttpError } from "./types/http-error";

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
      const errorData = await response.json().catch(() => ({}));

      throw new HttpError(
        response.status,
        errorData.error ||
          `API Error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }
}
