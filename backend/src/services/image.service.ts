import { supabaseAdmin } from "../config/database";
import path from "path";
import mime from 'mime-types';

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

      // Detect MIME type from the filename
      const mimeType = mime.lookup(originalFilename) || 'application/octet-stream';

      const timestamp = Date.now();
      const ext = path.extname(originalFilename).toLowerCase();
      const sanitizedFilename = path.basename(originalFilename, ext)
        .replace(/[^a-z0-9]/gi, '-')
        .toLowerCase();
      const filename = `${folder}/${sanitizedFilename}-${timestamp}${ext}`;

      // Create Blob with the detected MIME type
      const blob = new Blob([file], { type: mimeType });

      // Upload using the blob with explicit content type
      const { error: uploadError } = await supabaseAdmin.storage
        .from(this.bucketName)
        .upload(filename, blob, {
          upsert: true,
          contentType: mimeType // Set the correct content type
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