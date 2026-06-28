import { Router } from "express";
import { getAccounts, createAccount, updateAccount, deleteAccount } from "../controllers/accountController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", getAccounts);
router.post("/", createAccount);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);

export default router;