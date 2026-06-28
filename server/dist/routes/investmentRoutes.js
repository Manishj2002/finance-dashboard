"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const investmentController_1 = require("../controllers/investmentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", investmentController_1.getInvestments);
router.post("/", investmentController_1.createInvestment);
router.put("/:id", investmentController_1.updateInvestment);
router.delete("/:id", investmentController_1.deleteInvestment);
exports.default = router;
//# sourceMappingURL=investmentRoutes.js.map