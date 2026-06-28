import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getDebts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createDebt: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateDebt: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteDebt: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=debtController.d.ts.map