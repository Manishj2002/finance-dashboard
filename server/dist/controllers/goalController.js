"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGoal = exports.contributeToGoal = exports.updateGoal = exports.createGoal = exports.getGoals = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getGoals = async (req, res) => {
    try {
        const goals = await prisma_1.default.goal.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: "desc" },
        });
        const goalsWithPercentage = goals.map((goal) => ({
            ...goal,
            percentage: Math.round((goal.currentAmount / goal.targetAmount) * 100),
        }));
        res.json(goalsWithPercentage);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch goals" });
    }
};
exports.getGoals = getGoals;
const createGoal = async (req, res) => {
    try {
        const { name, targetAmount, currentAmount, deadline, icon, color } = req.body;
        const goal = await prisma_1.default.goal.create({
            data: {
                userId: req.userId,
                name,
                targetAmount: parseFloat(targetAmount),
                currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
                deadline: deadline ? new Date(deadline) : null,
                icon,
                color,
            },
        });
        res.status(201).json(goal);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create goal" });
    }
};
exports.createGoal = createGoal;
const updateGoal = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { name, targetAmount, currentAmount, deadline, icon, color } = req.body;
        const goal = await prisma_1.default.goal.findFirst({
            where: { id, userId: req.userId },
        });
        if (!goal) {
            res.status(404).json({ error: "Goal not found" });
            return;
        }
        const updated = await prisma_1.default.goal.update({
            where: { id },
            data: {
                name,
                targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
                currentAmount: currentAmount ? parseFloat(currentAmount) : undefined,
                deadline: deadline ? new Date(deadline) : undefined,
                icon,
                color,
            },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update goal" });
    }
};
exports.updateGoal = updateGoal;
const contributeToGoal = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { amount } = req.body;
        const goal = await prisma_1.default.goal.findFirst({
            where: { id, userId: req.userId },
        });
        if (!goal) {
            res.status(404).json({ error: "Goal not found" });
            return;
        }
        const updated = await prisma_1.default.goal.update({
            where: { id },
            data: { currentAmount: { increment: parseFloat(amount) } },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to contribute to goal" });
    }
};
exports.contributeToGoal = contributeToGoal;
const deleteGoal = async (req, res) => {
    try {
        const id = String(req.params.id);
        const goal = await prisma_1.default.goal.findFirst({
            where: { id, userId: req.userId },
        });
        if (!goal) {
            res.status(404).json({ error: "Goal not found" });
            return;
        }
        await prisma_1.default.goal.delete({ where: { id } });
        res.json({ message: "Goal deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete goal" });
    }
};
exports.deleteGoal = deleteGoal;
//# sourceMappingURL=goalController.js.map