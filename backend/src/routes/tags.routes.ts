import { Router } from "express";
import { TagsController } from "../controllers/tags.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const tagController = new TagsController();

// Routes publiques
router.get("/", tagController.getAllTags.bind(tagController));
router.get("/article/:articleId", tagController.getTagsByArticleId.bind(tagController));
router.get("/:slug", tagController.getTagBySlug.bind(tagController));

// Routes authentifiées (admin uniquement)
router.use(authenticate);

router.post("/", tagController.createTag.bind(tagController));
router.put("/:id", tagController.updateTag.bind(tagController));
router.delete("/:id", tagController.deleteTag.bind(tagController));

export default router;