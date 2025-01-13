import { Router } from "express";
import { CommentsController } from "../controllers/comments.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const commentsController = new CommentsController();

router.get(
    "/:article_id",
    commentsController.getCommentsByArticleId.bind(commentsController)
);

router.use(authenticate);

router.post(
    "/:article_id",
    commentsController.createComment.bind(commentsController)
);

router.put(
    "/:id",
    commentsController.updateComment.bind(commentsController)
);

router.delete(
    "/:id",
    commentsController.deleteComment.bind(commentsController)
);

export default router;
