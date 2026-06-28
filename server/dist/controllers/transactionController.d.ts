import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getTransactions: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createTransaction: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateTransaction: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteTransaction: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=transactionController.d.ts.map