import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getInvestments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createInvestment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateInvestment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteInvestment: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=investmentController.d.ts.map