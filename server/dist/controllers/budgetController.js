"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBudget = exports.updateBudget = exports.createBudget = exports.getBudgets = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getBudgets = async (req, res) => {
    try {
        const { month, year } = req.query;
        const currentDate = new Date();
        const m = month ? parseInt(month) : currentDate.getMonth() + 1;
        const y = year ? parseInt(year) : currentDate.getFullYear();
        const budgets = await prisma_1.default.budget.findMany({
            where: { userId: req.userId, month: m, year: y },
            include: {
                category: { select: { name: true, icon: true, color: true } },
            },
        });
        // Calculate spent for each budget
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0, 23, 59, 59);
        const budgetsWithSpent = await Promise.all(budgets.map(async (budget) => {
            const spent = await prisma_1.default.transaction.aggregate({
                where: {
                    userId: req.userId,
                    categoryId: budget.categoryId,
                    type: "EXPENSE",
                    date: { gte: startDate, lte: endDate },
                },
                _sum: { amount: true },
            });
            return {
                ...budget,
                spent: spent._sum.amount || 0,
                remaining: budget.amount - (spent._sum.amount || 0),
                percentage: Math.round(((spent._sum.amount || 0) / budget.amount) * 100),
            };
        }));
        res.json(budgetsWithSpent);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch budgets" });
    }
};
exports.getBudgets = getBudgets;
const createBudget = async (req, res) => {
    try {
        const { categoryId, amount, month, year } = req.body;
        const budget = await prisma_1.default.budget.create({
            data: {
                userId: req.userId,
                categoryId,
                amount: parseFloat(amount),
                month,
                year,
            },
            include: {
                category: { select: { name: true, icon: true, color: true } },
            },
        });
        res.status(201).json(budget);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create budget" });
    }
};
exports.createBudget = createBudget;
const updateBudget = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { amount } = req.body;
        const budget = await prisma_1.default.budget.findFirst({
            where: { id, userId: req.userId },
        });
        if (!budget) {
            res.status(404).json({ error: "Budget not found" });
            return;
        }
        const updated = await prisma_1.default.budget.update({
            where: { id },
            data: { amount: parseFloat(amount) },
            include: {
                category: { select: { name: true, icon: true, color: true } },
            },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update budget" });
    }
};
exports.updateBudget = updateBudget;
const deleteBudget = async (req, res) => {
    try {
        const id = String(req.params.id);
        const budget = await prisma_1.default.budget.findFirst({
            where: { id, userId: req.userId },
        });
        if (!budget) {
            res.status(404).json({ error: "Budget not found" });
            return;
        }
        await prisma_1.default.budget.delete({ where: { id } });
        res.json({ message: "Budget deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete budget" });
    }
};
exports.deleteBudget = deleteBudget;
//# sourceMappingURL=budgetController.js.map