import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth";

const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });
};

const defaultCategories = [
  { name: "Salary", type: "INCOME" as const, icon: "💰", color: "#10B981" },
  { name: "Freelance", type: "INCOME" as const, icon: "💻", color: "#3B82F6" },
  { name: "Investments", type: "INCOME" as const, icon: "📈", color: "#8B5CF6" },
  { name: "Other Income", type: "INCOME" as const, icon: "💵", color: "#06B6D4" },
  { name: "Food & Dining", type: "EXPENSE" as const, icon: "🍔", color: "#EF4444" },
  { name: "Transportation", type: "EXPENSE" as const, icon: "🚗", color: "#F59E0B" },
  { name: "Housing", type: "EXPENSE" as const, icon: "🏠", color: "#6366F1" },
  { name: "Utilities", type: "EXPENSE" as const, icon: "⚡", color: "#EC4899" },
  { name: "Entertainment", type: "EXPENSE" as const, icon: "🎬", color: "#14B8A6" },
  { name: "Shopping", type: "EXPENSE" as const, icon: "🛍️", color: "#F97316" },
  { name: "Healthcare", type: "EXPENSE" as const, icon: "🏥", color: "#EF4444" },
  { name: "Education", type: "EXPENSE" as const, icon: "📚", color: "#8B5CF6" },
  { name: "Subscriptions", type: "EXPENSE" as const, icon: "📱", color: "#06B6D4" },
  { name: "Other Expense", type: "EXPENSE" as const, icon: "📦", color: "#6B7280" },
];

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, currency } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        currency: currency || "USD",
      },
    });

    // Create default categories
    await prisma.category.createMany({
      data: defaultCategories.map((cat) => ({
        userId: user.id,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
      })),
    });

    // Create default checking account
    await prisma.account.create({
      data: {
        userId: user.id,
        name: "Main Checking",
        type: "CHECKING",
        balance: 0,
      },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: user.currency,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: user.currency,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token required" });
      return;
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currency: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};