"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.testDB = void 0;
const user_model_1 = __importDefault(require("@/models/user.model"));
const testDB = async (req, res) => {
    try {
        const testUser = await user_model_1.default.create({
            name: 'Test User',
            email: `test${Date.now()}@test.com`,
            password: 'test1234',
            role: 'user',
        });
        const user = testUser.toObject();
        const { password, ...userWithoutPassword } = user;
        res.status(200).json({
            status: 'success',
            message: 'Database connection successful!',
            data: {
                user: userWithoutPassword,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Database test failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
exports.testDB = testDB;
const getUsers = async (req, res) => {
    try {
        const users = await user_model_1.default.find().select('-password');
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch users',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
exports.getUsers = getUsers;
//# sourceMappingURL=test.controller.js.map