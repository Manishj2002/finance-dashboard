"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getCategories = async (req, res) => {
    try {
        const { type } = req.query;
        const where = { userId: req.userId };
        if (type)
            where.type = type;
        const categories = await prisma_1.default.category.findMany({
            where,
            orderBy: { name: "asc" },
        });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const { name, type, icon, color } = req.body;
        const category = await prisma_1.default.category.create({
            data: {
                userId: req.userId,
                name,
                type,
                icon: icon || "📦",
                color: color || "#6B7280",
            },
        });
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create category" });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { name, icon, color } = req.body;
        const category = await prisma_1.default.category.findFirst({
            where: { id, userId: req.userId },
        });
        if (!category) {
            res.status(404).json({ error: "Category not found" });
            return;
        }
        const updated = await prisma_1.default.category.update({
            where: { id },
            data: { name, icon, color },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update category" });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const id = String(req.params.id);
        const category = await prisma_1.default.category.findFirst({
            where: { id, userId: req.userId },
        });
        if (!category) {
            res.status(404).json({ error: "Category not found" });
            return;
        }
        await prisma_1.default.category.delete({ where: { id } });
        res.json({ message: "Category deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete category" });
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=categoryController.js.map