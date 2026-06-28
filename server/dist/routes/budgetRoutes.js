"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const budgetController_1 = require("../controllers/budgetController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", budgetController_1.getBudgets);
router.post("/", budgetController_1.createBudget);
router.put("/:id", budgetController_1.updateBudget);
router.delete("/:id", budgetController_1.deleteBudget);
exports.default = router;
//# sourceMappingURL=budgetRoutes.js.map