import { Router } from "express";
import { TagsController } from "../controllers/tags.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const tagController = new TagsController();

router.get("/", tagController.getAllTags.bind(tagController));
router.get("/article/:articleId", tagController.getTagsByArticleId.bind(tagController));
router.get("/:slug", tagController.getTagBySlug.bind(tagController));

router.use(authenticate);

router.post("/", tagController.createTag.bind(tagController));
router.put("/:id", tagController.updateTag.bind(tagController));
router.delete("/:id", tagController.deleteTag.bind(tagController));

export default router;