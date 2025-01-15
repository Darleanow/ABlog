import { API_CONFIG } from "../config/api.config";
import { IImageService } from "../services/image-service.interface";

import { BaseApi } from "./base-api";

export class ImageApi extends BaseApi implements IImageService {
  private readonly endpoint = API_CONFIG.endpoints.images.upload;

  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();

      formData.append("image", file);

      const token = this.getAuthToken();
      const headers: HeadersInit = {
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await fetch(`${this.baseUrl}${this.endpoint}`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(errorData.message || "Failed to upload image");
      }

      const data = await response.json();

      if (!data?.url) {
        throw new Error("No URL returned from server");
      }

      return data.url;
    } catch (error) {
      throw error instanceof Error ? error : new Error("Unknown upload error");
    }
  }
}
