import { Router } from "express";
import { getGoals, createGoal, updateGoal, contributeToGoal, deleteGoal } from "../controllers/goalController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", getGoals);
router.post("/", createGoal);
router.put("/:id", updateGoal);
router.post("/:id/contribute", contributeToGoal);
router.delete("/:id", deleteGoal);

export default router;