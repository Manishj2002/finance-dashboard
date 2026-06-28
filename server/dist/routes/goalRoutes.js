"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const goalController_1 = require("../controllers/goalController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", goalController_1.getGoals);
router.post("/", goalController_1.createGoal);
router.put("/:id", goalController_1.updateGoal);
router.post("/:id/contribute", goalController_1.contributeToGoal);
router.delete("/:id", goalController_1.deleteGoal);
exports.default = router;
//# sourceMappingURL=goalRoutes.js.map