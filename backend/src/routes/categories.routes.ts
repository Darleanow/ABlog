import { Router } from "express";
import { CategoriesController } from "../controllers/categories.controller";
import {requireAdmin} from "../middleware/auth.middleware";

const router = Router();
const categoryController = new CategoriesController();

// public routes
router.get("/", categoryController.getAllCategories.bind(categoryController));
router.get("/article/:articleId", categoryController.getCategoriesByArticleId.bind(categoryController));
router.get("/:slug", categoryController.getCategoryBySlug.bind(categoryController));


router.use(requireAdmin);

router.post("/", categoryController.createCategory.bind(categoryController));
router.put("/:id", categoryController.updateCategory.bind(categoryController));
router.delete("/:id", categoryController.deleteCategory.bind(categoryController));

export default router;