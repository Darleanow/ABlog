import { Router } from "express";
import { CommentsController } from "../controllers/comments.controller";
import {authenticate, verifyOwnership} from "../middleware/auth.middleware";

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
    verifyOwnership("comments"),
    commentsController.updateComment.bind(commentsController)
);

router.delete(
    "/:id",
    verifyOwnership("comments"),
    commentsController.deleteComment.bind(commentsController)
);

export default router;
