import { Router } from "express";
import { UserController } from "./../controllers/users.controller";

const router = Router();
const tagController = new UserController();

router.get("/:id", tagController.getUserById.bind(tagController));
router.get("/email/:email", tagController.getUserByEmail.bind(tagController));

export default router;
