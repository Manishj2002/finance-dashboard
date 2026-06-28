"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.updateAccount = exports.createAccount = exports.getAccounts = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getAccounts = async (req, res) => {
    try {
        const accounts = await prisma_1.default.account.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: "asc" },
        });
        res.json(accounts);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch accounts" });
    }
};
exports.getAccounts = getAccounts;
const createAccount = async (req, res) => {
    try {
        const { name, type, balance, institution, color } = req.body;
        const account = await prisma_1.default.account.create({
            data: {
                userId: req.userId,
                name,
                type,
                balance: balance || 0,
                institution,
                color,
            },
        });
        res.status(201).json(account);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create account" });
    }
};
exports.createAccount = createAccount;
const updateAccount = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { name, type, balance, institution, color } = req.body;
        const account = await prisma_1.default.account.findFirst({
            where: { id, userId: req.userId },
        });
        if (!account) {
            res.status(404).json({ error: "Account not found" });
            return;
        }
        const updated = await prisma_1.default.account.update({
            where: { id },
            data: { name, type, balance, institution, color },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update account" });
    }
};
exports.updateAccount = updateAccount;
const deleteAccount = async (req, res) => {
    try {
        const id = String(req.params.id);
        const account = await prisma_1.default.account.findFirst({
            where: { id, userId: req.userId },
        });
        if (!account) {
            res.status(404).json({ error: "Account not found" });
            return;
        }
        await prisma_1.default.account.delete({ where: { id } });
        res.json({ message: "Account deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete account" });
    }
};
exports.deleteAccount = deleteAccount;
//# sourceMappingURL=accountController.js.map