import { Router } from "express";
import TaskFlow from "../controllers/taskControllers.js";
import TaskMiddlewares from "../middlewares/taskMiddlewares.js";

export const router = Router();

router.get("/tasks", TaskFlow.ListTask);
router.post("/tasks",TaskMiddlewares.validadateCreate, TaskFlow.CreateTask);
router.patch("/tasks/:id", TaskMiddlewares.validadateUpdate, TaskFlow.UpdateTask);
router.patch("/tasks/:id/favorite", TaskMiddlewares.validateFavorite, TaskFlow.addfavorite);
router.patch("/tasks/:id/completed", TaskMiddlewares.validateCompleted, TaskFlow.CompleteTask);
router.delete("/tasks/:id", TaskMiddlewares.validadate, TaskFlow.DeleteTask);