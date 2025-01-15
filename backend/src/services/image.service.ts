// src/services/image.service.ts
import { supabaseAdmin } from "../config/database";
import path from "path";

export interface IImageStorageService {
  uploadImage(file: Buffer, filename: string, folder: string): Promise<string>;
}

export class SupabaseImageService implements IImageStorageService {
  private readonly bucketName = "images";

  constructor() {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client is not initialized. Check SUPABASE_SERVICE_ROLE_KEY");
    }
  }

  async uploadImage(
    file: Buffer,
    originalFilename: string,
    folder: string
  ): Promise<string> {
    try {
      if (!supabaseAdmin) {
        throw new Error("Supabase admin client is not initialized");
      }

      const timestamp = Date.now();
      const ext = path.extname(originalFilename).toLowerCase();
      const sanitizedFilename = path.basename(originalFilename, ext)
        .replace(/[^a-z0-9]/gi, '-')
        .toLowerCase();
      const filename = `${folder}/${sanitizedFilename}-${timestamp}${ext}`;

      // Convert Buffer to Blob with proper type
      const blob = new Blob([file], { type: 'image/png' });

      // Upload using the blob
      const { error: uploadError } = await supabaseAdmin.storage
        .from(this.bucketName)
        .upload(filename, blob, {
          upsert: true
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabaseAdmin.storage
        .from(this.bucketName)
        .getPublicUrl(filename);

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error in SupabaseImageService:", error);
      throw error instanceof Error ? error : new Error("Unknown storage error");
    }
  }
}