"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDebt = exports.updateDebt = exports.createDebt = exports.getDebts = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getDebts = async (req, res) => {
    try {
        const debts = await prisma_1.default.debt.findMany({
            where: { userId: req.userId },
            orderBy: { interestRate: "desc" },
        });
        const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
        const totalMinPayment = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
        res.json({
            debts,
            summary: {
                totalDebt,
                totalMinPayment,
                count: debts.length,
                avgInterestRate: debts.length > 0
                    ? Math.round((debts.reduce((sum, d) => sum + d.interestRate, 0) /
                        debts.length) *
                        100) / 100
                    : 0,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch debts" });
    }
};
exports.getDebts = getDebts;
const createDebt = async (req, res) => {
    try {
        const { name, type, balance, interestRate, minimumPayment, dueDate } = req.body;
        const debt = await prisma_1.default.debt.create({
            data: {
                userId: req.userId,
                name,
                type,
                balance: parseFloat(balance),
                interestRate: parseFloat(interestRate),
                minimumPayment: parseFloat(minimumPayment),
                dueDate: dueDate ? parseInt(dueDate) : null,
            },
        });
        res.status(201).json(debt);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create debt" });
    }
};
exports.createDebt = createDebt;
const updateDebt = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { name, type, balance, interestRate, minimumPayment, dueDate } = req.body;
        const debt = await prisma_1.default.debt.findFirst({
            where: { id, userId: req.userId },
        });
        if (!debt) {
            res.status(404).json({ error: "Debt not found" });
            return;
        }
        const updated = await prisma_1.default.debt.update({
            where: { id },
            data: {
                name,
                type,
                balance: balance ? parseFloat(balance) : undefined,
                interestRate: interestRate ? parseFloat(interestRate) : undefined,
                minimumPayment: minimumPayment
                    ? parseFloat(minimumPayment)
                    : undefined,
                dueDate: dueDate ? parseInt(dueDate) : undefined,
            },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update debt" });
    }
};
exports.updateDebt = updateDebt;
const deleteDebt = async (req, res) => {
    try {
        const id = String(req.params.id);
        const debt = await prisma_1.default.debt.findFirst({
            where: { id, userId: req.userId },
        });
        if (!debt) {
            res.status(404).json({ error: "Debt not found" });
            return;
        }
        await prisma_1.default.debt.delete({ where: { id } });
        res.json({ message: "Debt deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete debt" });
    }
};
exports.deleteDebt = deleteDebt;
//# sourceMappingURL=debtController.js.map