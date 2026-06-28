import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth";

export const getDebts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const debts = await prisma.debt.findMany({
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
        avgInterestRate:
          debts.length > 0
            ? Math.round(
                (debts.reduce((sum, d) => sum + d.interestRate, 0) /
                  debts.length) *
                  100
              ) / 100
            : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch debts" });
  }
};

export const createDebt = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, type, balance, interestRate, minimumPayment, dueDate } =
      req.body;

    const debt = await prisma.debt.create({
      data: {
        userId: req.userId!,
        name,
        type,
        balance: parseFloat(balance),
        interestRate: parseFloat(interestRate),
        minimumPayment: parseFloat(minimumPayment),
        dueDate: dueDate ? parseInt(dueDate) : null,
      },
    });

    res.status(201).json(debt);
  } catch (error) {
    res.status(500).json({ error: "Failed to create debt" });
  }
};

export const updateDebt = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { name, type, balance, interestRate, minimumPayment, dueDate } =
      req.body;

    const debt = await prisma.debt.findFirst({
      where: { id, userId: req.userId },
    });

    if (!debt) {
      res.status(404).json({ error: "Debt not found" });
      return;
    }

    const updated = await prisma.debt.update({
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
  } catch (error) {
    res.status(500).json({ error: "Failed to update debt" });
  }
};

export const deleteDebt = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const debt = await prisma.debt.findFirst({
      where: { id, userId: req.userId },
    });

    if (!debt) {
      res.status(404).json({ error: "Debt not found" });
      return;
    }

    await prisma.debt.delete({ where: { id } });
    res.json({ message: "Debt deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete debt" });
  }
};