import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth";

export const getCategories = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { type } = req.query;

    const where: any = { userId: req.userId };
    if (type) where.type = type;

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const createCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, type, icon, color } = req.body;

    const category = await prisma.category.create({
      data: {
        userId: req.userId!,
        name,
        type,
        icon: icon || "📦",
        color: color || "#6B7280",
      },
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { name, icon, color } = req.body;

    const category = await prisma.category.findFirst({
      where: { id, userId: req.userId },
    });

    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name, icon, color },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update category" });
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const category = await prisma.category.findFirst({
      where: { id, userId: req.userId },
    });

    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    await prisma.category.delete({ where: { id } });
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
};