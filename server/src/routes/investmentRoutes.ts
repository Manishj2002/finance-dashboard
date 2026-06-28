import { Router } from "express";
import { getInvestments, createInvestment, updateInvestment, deleteInvestment } from "../controllers/investmentController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", getInvestments);
router.post("/", createInvestment);
router.put("/:id", updateInvestment);
router.delete("/:id", deleteInvestment);

export default router;