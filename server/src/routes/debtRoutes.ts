import { Router } from "express";
import { getDebts, createDebt, updateDebt, deleteDebt } from "../controllers/debtController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", getDebts);
router.post("/", createDebt);
router.put("/:id", updateDebt);
router.delete("/:id", deleteDebt);

export default router;