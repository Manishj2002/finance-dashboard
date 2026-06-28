"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInvestment = exports.updateInvestment = exports.createInvestment = exports.getInvestments = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getInvestments = async (req, res) => {
    try {
        const investments = await prisma_1.default.investment.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: "desc" },
        });
        const investmentsWithGain = investments.map((inv) => {
            const currentValue = inv.quantity * inv.currentPrice;
            const costBasis = inv.quantity * inv.avgCost;
            const gainLoss = currentValue - costBasis;
            const gainLossPercent = costBasis > 0 ? ((gainLoss / costBasis) * 100) : 0;
            return {
                ...inv,
                currentValue,
                costBasis,
                gainLoss,
                gainLossPercent: Math.round(gainLossPercent * 100) / 100,
            };
        });
        const totalValue = investmentsWithGain.reduce((sum, inv) => sum + inv.currentValue, 0);
        const totalCost = investmentsWithGain.reduce((sum, inv) => sum + inv.costBasis, 0);
        res.json({
            investments: investmentsWithGain,
            summary: {
                totalValue,
                totalCost,
                totalGainLoss: totalValue - totalCost,
                totalGainLossPercent: totalCost > 0
                    ? Math.round(((totalValue - totalCost) / totalCost) * 10000) / 100
                    : 0,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch investments" });
    }
};
exports.getInvestments = getInvestments;
const createInvestment = async (req, res) => {
    try {
        const { name, ticker, type, quantity, avgCost, currentPrice } = req.body;
        const investment = await prisma_1.default.investment.create({
            data: {
                userId: req.userId,
                name,
                ticker,
                type,
                quantity: parseFloat(quantity),
                avgCost: parseFloat(avgCost),
                currentPrice: parseFloat(currentPrice),
            },
        });
        res.status(201).json(investment);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create investment" });
    }
};
exports.createInvestment = createInvestment;
const updateInvestment = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { name, ticker, type, quantity, avgCost, currentPrice } = req.body;
        const investment = await prisma_1.default.investment.findFirst({
            where: { id, userId: req.userId },
        });
        if (!investment) {
            res.status(404).json({ error: "Investment not found" });
            return;
        }
        const updated = await prisma_1.default.investment.update({
            where: { id },
            data: {
                name,
                ticker,
                type,
                quantity: quantity ? parseFloat(quantity) : undefined,
                avgCost: avgCost ? parseFloat(avgCost) : undefined,
                currentPrice: currentPrice ? parseFloat(currentPrice) : undefined,
            },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update investment" });
    }
};
exports.updateInvestment = updateInvestment;
const deleteInvestment = async (req, res) => {
    try {
        const id = String(req.params.id);
        const investment = await prisma_1.default.investment.findFirst({
            where: { id, userId: req.userId },
        });
        if (!investment) {
            res.status(404).json({ error: "Investment not found" });
            return;
        }
        await prisma_1.default.investment.delete({ where: { id } });
        res.json({ message: "Investment deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete investment" });
    }
};
exports.deleteInvestment = deleteInvestment;
//# sourceMappingURL=investmentController.js.map