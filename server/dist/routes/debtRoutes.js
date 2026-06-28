"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const debtController_1 = require("../controllers/debtController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", debtController_1.getDebts);
router.post("/", debtController_1.createDebt);
router.put("/:id", debtController_1.updateDebt);
router.delete("/:id", debtController_1.deleteDebt);
exports.default = router;
//# sourceMappingURL=debtRoutes.js.map