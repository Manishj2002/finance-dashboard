"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accountController_1 = require("../controllers/accountController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", accountController_1.getAccounts);
router.post("/", accountController_1.createAccount);
router.put("/:id", accountController_1.updateAccount);
router.delete("/:id", accountController_1.deleteAccount);
exports.default = router;
//# sourceMappingURL=accountRoutes.js.map