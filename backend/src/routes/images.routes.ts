// src/routes/images.routes.ts
import express from "express";
import { ImagesController, upload } from "../controllers/image.controller";
import { SupabaseImageService } from "../services/image.service";

const router = express.Router();
const imageService = new SupabaseImageService();
const imagesController = new ImagesController(imageService);

router.post(
  "/upload",
  (req, res, next) => {
    upload(req, res, function (err: any) {
      if (err) {
        res.status(400).json({ message: err.message });
        return;
      }
      next();
    });
  },
  (req, res) => imagesController.uploadImage(req, res)
);

export default router;
