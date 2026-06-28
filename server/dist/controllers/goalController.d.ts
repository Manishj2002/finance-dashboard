import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getGoals: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createGoal: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateGoal: (req: AuthRequest, res: Response) => Promise<void>;
export declare const contributeToGoal: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteGoal: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=goalController.d.ts.map