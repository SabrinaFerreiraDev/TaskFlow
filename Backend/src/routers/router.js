import { Router } from "express";
import TaskFlow from "../controllers/taskControllers.js";
import TaskMiddlewares from "../middlewares/taskMiddlewares.js";
import { register } from "../controllers/TaskLogin.js";
import { authenticate, validateCredentials } from "../middlewares/AuthMiddlewares.js";
import { authRouter } from "./authRouter.js";

export const router = Router();

router.post("/users", validateCredentials, register);
router.use("/auth", authRouter);

router.use("/tasks", authenticate);
router.get("/tasks", TaskFlow.ListTask);
router.post("/tasks", TaskMiddlewares.validateCreate, TaskFlow.CreateTask);
router.patch("/tasks/:id", TaskMiddlewares.validadateUpdate, TaskFlow.UpdateTask);
router.patch("/tasks/:id/favorite", TaskMiddlewares.validateFavorite, TaskFlow.addfavorite);
router.patch("/tasks/:id/completed", TaskMiddlewares.validateCompleted, TaskFlow.CompleteTask);
router.delete("/tasks/:id", TaskMiddlewares.validadate, TaskFlow.DeleteTask);
