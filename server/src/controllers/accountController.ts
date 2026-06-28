import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth";

export const getAccounts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "asc" },
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
};

export const createAccount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, type, balance, institution, color } = req.body;

    const account = await prisma.account.create({
      data: {
        userId: req.userId!,
        name,
        type,
        balance: balance || 0,
        institution,
        color,
      },
    });

    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: "Failed to create account" });
  }
};

export const updateAccount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { name, type, balance, institution, color } = req.body;

    const account = await prisma.account.findFirst({
      where: { id, userId: req.userId },
    });

    if (!account) {
      res.status(404).json({ error: "Account not found" });
      return;
    }

    const updated = await prisma.account.update({
      where: { id },
      data: { name, type, balance, institution, color },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update account" });
  }
};

export const deleteAccount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const account = await prisma.account.findFirst({
      where: { id, userId: req.userId },
    });

    if (!account) {
      res.status(404).json({ error: "Account not found" });
      return;
    }

    await prisma.account.delete({ where: { id } });
    res.json({ message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete account" });
  }
};