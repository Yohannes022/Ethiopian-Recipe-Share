"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const test_controller_1 = require("@/controllers/test.controller");
const router = (0, express_1.Router)();
router.get('/db', test_controller_1.testDB);
router.get('/users', test_controller_1.getUsers);
exports.default = router;
//# sourceMappingURL=test.routes.js.map