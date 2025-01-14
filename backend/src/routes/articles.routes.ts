import { Router } from "express";
import { ArticlesController } from "../controllers/articles.controller";
import { authenticate, verifyOwnership } from "../middleware/auth.middleware";


const router = Router();
const articleController = new ArticlesController();

router.get("/", articleController.getAllArticles.bind(articleController));
router.get("/:slug", articleController.getArticleBySlug.bind(articleController));

router.use(authenticate);

router.post("/", articleController.createArticle.bind(articleController));
router.put("/:id",
    verifyOwnership("articles"),
    articleController.updateArticle.bind(articleController)
);
router.delete("/:id",
    verifyOwnership("articles"),
    articleController.deleteArticle.bind(articleController)
);

router.post("/:id/like", articleController.likeArticle.bind(articleController));
router.delete("/:id/like", articleController.unlikeArticle.bind(articleController));
router.post("/:id/favorite", articleController.favoriteArticle.bind(articleController));
router.delete("/:id/favorite", articleController.unfavoriteArticle.bind(articleController));

export default router;
