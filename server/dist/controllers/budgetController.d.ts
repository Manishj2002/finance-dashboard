import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getBudgets: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createBudget: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateBudget: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteBudget: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=budgetController.d.ts.map