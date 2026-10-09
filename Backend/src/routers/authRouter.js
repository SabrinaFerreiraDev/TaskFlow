import { Router } from "express";
import { login, me } from "../controllers/TaskLogin.js";
import { authenticate, validateCredentials, validateUserLogin } from "../middlewares/AuthMiddlewares.js";

export const authRouter = Router();

authRouter.post("/login", validateCredentials, validateUserLogin, login);
authRouter.get("/me", authenticate, me);
