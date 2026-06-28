import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth";

export const getInvestments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const investments = await prisma.investment.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });

    const investmentsWithGain = investments.map((inv) => {
      const currentValue = inv.quantity * inv.currentPrice;
      const costBasis = inv.quantity * inv.avgCost;
      const gainLoss = currentValue - costBasis;
      const gainLossPercent =
        costBasis > 0 ? ((gainLoss / costBasis) * 100) : 0;

      return {
        ...inv,
        currentValue,
        costBasis,
        gainLoss,
        gainLossPercent: Math.round(gainLossPercent * 100) / 100,
      };
    });

    const totalValue = investmentsWithGain.reduce(
      (sum, inv) => sum + inv.currentValue, 0
    );
    const totalCost = investmentsWithGain.reduce(
      (sum, inv) => sum + inv.costBasis, 0
    );

    res.json({
      investments: investmentsWithGain,
      summary: {
        totalValue,
        totalCost,
        totalGainLoss: totalValue - totalCost,
        totalGainLossPercent:
          totalCost > 0
            ? Math.round(((totalValue - totalCost) / totalCost) * 10000) / 100
            : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch investments" });
  }
};

export const createInvestment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, ticker, type, quantity, avgCost, currentPrice } = req.body;

    const investment = await prisma.investment.create({
      data: {
        userId: req.userId!,
        name,
        ticker,
        type,
        quantity: parseFloat(quantity),
        avgCost: parseFloat(avgCost),
        currentPrice: parseFloat(currentPrice),
      },
    });

    res.status(201).json(investment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create investment" });
  }
};

export const updateInvestment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { name, ticker, type, quantity, avgCost, currentPrice } = req.body;

    const investment = await prisma.investment.findFirst({
      where: { id, userId: req.userId },
    });

    if (!investment) {
      res.status(404).json({ error: "Investment not found" });
      return;
    }

    const updated = await prisma.investment.update({
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
  } catch (error) {
    res.status(500).json({ error: "Failed to update investment" });
  }
};

export const deleteInvestment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const investment = await prisma.investment.findFirst({
      where: { id, userId: req.userId },
    });

    if (!investment) {
      res.status(404).json({ error: "Investment not found" });
      return;
    }

    await prisma.investment.delete({ where: { id } });
    res.json({ message: "Investment deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete investment" });
  }
};