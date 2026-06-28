import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth";

export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23, 59, 59
    );
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23, 59, 59
    );

    // Total balance
    const accounts = await prisma.account.findMany({
      where: { userId: req.userId },
    });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Current month income & expenses
    const currentMonthIncome = await prisma.transaction.aggregate({
      where: {
        userId: req.userId,
        type: "INCOME",
        date: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      _sum: { amount: true },
    });

    const currentMonthExpenses = await prisma.transaction.aggregate({
      where: {
        userId: req.userId,
        type: "EXPENSE",
        date: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      _sum: { amount: true },
    });

    // Last month income & expenses (for trend comparison)
    const lastMonthIncome = await prisma.transaction.aggregate({
      where: {
        userId: req.userId,
        type: "INCOME",
        date: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { amount: true },
    });

    const lastMonthExpenses = await prisma.transaction.aggregate({
      where: {
        userId: req.userId,
        type: "EXPENSE",
        date: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { amount: true },
    });

    const income = currentMonthIncome._sum.amount || 0;
    const expenses = currentMonthExpenses._sum.amount || 0;
    const lastIncome = lastMonthIncome._sum.amount || 0;
    const lastExpenses = lastMonthExpenses._sum.amount || 0;

    const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

    // Spending by category (current month)
    const spendingByCategory = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId: req.userId,
        type: "EXPENSE",
        date: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      _sum: { amount: true },
    });

    const categoryIds = spendingByCategory.map((s) => s.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const spendingByCategoryWithDetails = spendingByCategory.map((s) => {
      const cat = categories.find((c) => c.id === s.categoryId);
      return {
        categoryId: s.categoryId,
        categoryName: cat?.name || "Unknown",
        icon: cat?.icon || "📦",
        color: cat?.color || "#6B7280",
        amount: s._sum.amount || 0,
      };
    }).sort((a, b) => b.amount - a.amount);

    // Cash flow (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const cashFlowData = [];

    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(
        sixMonthsAgo.getFullYear(),
        sixMonthsAgo.getMonth() + i,
        1
      );
      const monthEnd = new Date(
        sixMonthsAgo.getFullYear(),
        sixMonthsAgo.getMonth() + i + 1,
        0,
        23, 59, 59
      );

      const [monthIncome, monthExpense] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            userId: req.userId,
            type: "INCOME",
            date: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            userId: req.userId,
            type: "EXPENSE",
            date: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        }),
      ]);

      cashFlowData.push({
        month: monthStart.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        income: monthIncome._sum.amount || 0,
        expenses: monthExpense._sum.amount || 0,
      });
    }

    // Recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: req.userId },
      include: {
        category: { select: { name: true, icon: true, color: true } },
        account: { select: { name: true } },
      },
      orderBy: { date: "desc" },
      take: 10,
    });

    res.json({
      summary: {
        totalBalance,
        monthlyIncome: income,
        monthlyExpenses: expenses,
        savingsRate,
        incomeTrend: lastIncome > 0 ? Math.round(((income - lastIncome) / lastIncome) * 100) : 0,
        expenseTrend: lastExpenses > 0 ? Math.round(((expenses - lastExpenses) / lastExpenses) * 100) : 0,
      },
      spendingByCategory: spendingByCategoryWithDetails,
      cashFlow: cashFlowData,
      recentTransactions,
      accounts,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};