import { Router } from "express";
import { CommentsController } from "../controllers/comments.controller";
import {authenticate, verifyUserOwnership} from "../middleware/auth.middleware";

const router = Router();
const commentController = new CommentsController();

router.get("/article/:articleId", commentController.getCommentsByArticleId.bind(commentController));
router.get("/:id", commentController.getCommentById.bind(commentController));
router.get("/:commentId/replies", commentController.getRepliesByCommentId.bind(commentController));


router.use(authenticate);

router.post("/article/:articleId", commentController.createComment.bind(commentController));
router.put("/:id", verifyUserOwnership(),commentController.updateComment.bind(commentController));
router.delete("/:id", verifyUserOwnership(), commentController.deleteComment.bind(commentController));

export default router;