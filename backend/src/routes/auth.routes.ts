import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

router.post("/signup", authController.signUp.bind(authController));
router.post("/signin", authController.signIn.bind(authController));
router.post("/signout", authController.signOut.bind(authController));

export default router;