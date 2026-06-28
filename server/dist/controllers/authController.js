"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.refreshToken = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const generateAccessToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "15m",
    });
};
const generateRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
};
const defaultCategories = [
    { name: "Salary", type: "INCOME", icon: "💰", color: "#10B981" },
    { name: "Freelance", type: "INCOME", icon: "💻", color: "#3B82F6" },
    { name: "Investments", type: "INCOME", icon: "📈", color: "#8B5CF6" },
    { name: "Other Income", type: "INCOME", icon: "💵", color: "#06B6D4" },
    { name: "Food & Dining", type: "EXPENSE", icon: "🍔", color: "#EF4444" },
    { name: "Transportation", type: "EXPENSE", icon: "🚗", color: "#F59E0B" },
    { name: "Housing", type: "EXPENSE", icon: "🏠", color: "#6366F1" },
    { name: "Utilities", type: "EXPENSE", icon: "⚡", color: "#EC4899" },
    { name: "Entertainment", type: "EXPENSE", icon: "🎬", color: "#14B8A6" },
    { name: "Shopping", type: "EXPENSE", icon: "🛍️", color: "#F97316" },
    { name: "Healthcare", type: "EXPENSE", icon: "🏥", color: "#EF4444" },
    { name: "Education", type: "EXPENSE", icon: "📚", color: "#8B5CF6" },
    { name: "Subscriptions", type: "EXPENSE", icon: "📱", color: "#06B6D4" },
    { name: "Other Expense", type: "EXPENSE", icon: "📦", color: "#6B7280" },
];
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, currency } = req.body;
        if (!email || !password || !firstName || !lastName) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(409).json({ error: "Email already registered" });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                currency: currency || "USD",
            },
        });
        // Create default categories
        await prisma_1.default.category.createMany({
            data: defaultCategories.map((cat) => ({
                userId: user.id,
                name: cat.name,
                type: cat.type,
                icon: cat.icon,
                color: cat.color,
            })),
        });
        // Create default checking account
        await prisma_1.default.account.create({
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
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
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
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ error: "Refresh token required" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user) {
            res.status(401).json({ error: "User not found" });
            return;
        }
        const newAccessToken = generateAccessToken(user.id);
        const newRefreshToken = generateRefreshToken(user.id);
        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    }
    catch (error) {
        res.status(401).json({ error: "Invalid refresh token" });
    }
};
exports.refreshToken = refreshToken;
const getMe = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
};
exports.getMe = getMe;
//# sourceMappingURL=authController.js.map