"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const module_alias_1 = __importDefault(require("module-alias"));
const path_1 = __importDefault(require("path"));
// In development, we use ts-node which runs from src/
// In production, the code is compiled to dist/
const isProduction = process.env.NODE_ENV === 'production';
// Register the aliases
module_alias_1.default.addAliases({
    '@': isProduction ? path_1.default.join(__dirname, '..') : path_1.default.join(__dirname, '../..'),
    '@src': path_1.default.join(__dirname, '../..') // Always point to src/ from project root
});
// Apply the aliases
(0, module_alias_1.default)();
exports.default = module_alias_1.default;
