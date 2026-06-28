"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./middleware/errorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const accountRoutes_1 = __importDefault(require("./routes/accountRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const budgetRoutes_1 = __importDefault(require("./routes/budgetRoutes"));
const goalRoutes_1 = __importDefault(require("./routes/goalRoutes"));
const investmentRoutes_1 = __importDefault(require("./routes/investmentRoutes"));
const debtRoutes_1 = __importDefault(require("./routes/debtRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express_1.default.json());
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/accounts", accountRoutes_1.default);
app.use("/api/categories", categoryRoutes_1.default);
app.use("/api/transactions", transactionRoutes_1.default);
app.use("/api/budgets", budgetRoutes_1.default);
app.use("/api/goals", goalRoutes_1.default);
app.use("/api/investments", investmentRoutes_1.default);
app.use("/api/debts", debtRoutes_1.default);
app.use("/api/dashboard", dashboardRoutes_1.default);
// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});
// Error handler
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map