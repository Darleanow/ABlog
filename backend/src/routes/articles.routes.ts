import { Router } from "express";
import { ArticlesController } from "../controllers/articles.controller";
import { authenticate, verifyOwnership } from "../middleware/auth.middleware";
import type { Response, RequestHandler } from "express";
import type { AuthenticatedRequest } from "../models/auth";

const router = Router();
const articlesController = new ArticlesController();

const asyncHandler = (
  handler: (req: AuthenticatedRequest, res: Response) => Promise<Response>
) => {
  return (async (req, res, next) => {
    try {
      await handler(req as AuthenticatedRequest, res);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler;
};

router.get(
  "/",
  asyncHandler(articlesController.getAllArticles.bind(articlesController))
);

router.get(
  "/:slug",
  asyncHandler(articlesController.getArticleBySlug.bind(articlesController))
);

router.use(authenticate);

router.post(
  "/",
  asyncHandler(articlesController.createArticle.bind(articlesController))
);

router.put(
  "/:id",
  verifyOwnership("articles"),
  asyncHandler(articlesController.updateArticle.bind(articlesController))
);

export default router;
