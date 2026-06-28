import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth";

export const getGoals = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });

    const goalsWithPercentage = goals.map((goal) => ({
      ...goal,
      percentage: Math.round((goal.currentAmount / goal.targetAmount) * 100),
    }));

    res.json(goalsWithPercentage);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};

export const createGoal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, targetAmount, currentAmount, deadline, icon, color } =
      req.body;

    const goal = await prisma.goal.create({
      data: {
        userId: req.userId!,
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        deadline: deadline ? new Date(deadline) : null,
        icon,
        color,
      },
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: "Failed to create goal" });
  }
};

export const updateGoal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { name, targetAmount, currentAmount, deadline, icon, color } =
      req.body;

    const goal = await prisma.goal.findFirst({
      where: { id, userId: req.userId },
    });

    if (!goal) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    const updated = await prisma.goal.update({
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
  } catch (error) {
    res.status(500).json({ error: "Failed to update goal" });
  }
};

export const contributeToGoal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { amount } = req.body;

    const goal = await prisma.goal.findFirst({
      where: { id, userId: req.userId },
    });

    if (!goal) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: { currentAmount: { increment: parseFloat(amount) } },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to contribute to goal" });
  }
};

export const deleteGoal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const goal = await prisma.goal.findFirst({
      where: { id, userId: req.userId },
    });

    if (!goal) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    await prisma.goal.delete({ where: { id } });
    res.json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete goal" });
  }
};