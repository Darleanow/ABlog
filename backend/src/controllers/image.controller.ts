// src/controllers/image.controller.ts
import { Request, Response } from "express";
import multer from "multer";
import { IImageStorageService } from "../services/image.service";

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp'
];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not supported. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
    }
  },
}).single('image');

export class ImagesController {
  constructor(private readonly imageService: IImageStorageService) {}

  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file provided" });
        return;
      }

      console.log('Processing upload:', { 
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      const url = await this.imageService.uploadImage(
        req.file.buffer,
        req.file.originalname,
        'uploads'
      );

      res.status(200).json({ url });
    } catch (error) {
      console.error("Error handling image upload:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to upload image",
      });
    }
  }
}