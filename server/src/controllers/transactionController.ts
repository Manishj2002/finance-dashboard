import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth";

export const getTransactions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "20",
      type,
      categoryId,
      accountId,
      startDate,
      endDate,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId: req.userId };

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (accountId) where.accountId = accountId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }
    if (search) {
      where.description = { contains: search as string, mode: "insensitive" };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: { select: { name: true, icon: true, color: true } },
          account: { select: { name: true } },
        },
        orderBy: { date: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

export const createTransaction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { accountId, categoryId, type, amount, description, date, notes } =
      req.body;

    if (!accountId || !categoryId || !type || !amount || !description || !date) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: req.userId },
    });

    if (!account) {
      res.status(404).json({ error: "Account not found" });
      return;
    }

    const transaction = await prisma.$transaction(async (tx) => {
      // Create the transaction
      const newTransaction = await tx.transaction.create({
        data: {
          userId: req.userId!,
          accountId,
          categoryId,
          type,
          amount: parseFloat(amount),
          description,
          date: new Date(date),
          notes,
        },
        include: {
          category: { select: { name: true, icon: true, color: true } },
          account: { select: { name: true } },
        },
      });

      // Update account balance
      const balanceChange =
        type === "INCOME" ? parseFloat(amount) : -parseFloat(amount);

      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: balanceChange } },
      });

      return newTransaction;
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({ error: "Failed to create transaction" });
  }
};

export const updateTransaction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { accountId, categoryId, type, amount, description, date, notes } =
      req.body;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Reverse old balance effect
      const oldBalanceChange =
        existing.type === "INCOME" ? -existing.amount : existing.amount;

      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: oldBalanceChange } },
      });

      // Update transaction
      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: {
          accountId,
          categoryId,
          type,
          amount: amount ? parseFloat(amount) : undefined,
          description,
          date: date ? new Date(date) : undefined,
          notes,
        },
        include: {
          category: { select: { name: true, icon: true, color: true } },
          account: { select: { name: true } },
        },
      });

      // Apply new balance effect
      const newBalanceChange =
        updatedTransaction.type === "INCOME"
          ? updatedTransaction.amount
          : -updatedTransaction.amount;

      await tx.account.update({
        where: { id: updatedTransaction.accountId },
        data: { balance: { increment: newBalanceChange } },
      });

      return updatedTransaction;
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update transaction" });
  }
};

export const deleteTransaction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.userId },
    });

    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Reverse balance effect
      const balanceChange =
        transaction.type === "INCOME"
          ? -transaction.amount
          : transaction.amount;

      await tx.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: balanceChange } },
      });

      await tx.transaction.delete({ where: { id } });
    });

    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete transaction" });
  }
};