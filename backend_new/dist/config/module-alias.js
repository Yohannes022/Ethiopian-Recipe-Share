"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const path_1 = __importDefault(require("path"));
const module_alias_1 = __importDefault(require("module-alias"));
module_alias_1.default.addAliases({
    '@': path_1.default.join(__dirname, '..'),
    '@config': path_1.default.join(__dirname, '..', 'config'),
    '@controllers': path_1.default.join(__dirname, '..', 'controllers'),
    '@middlewares': path_1.default.join(__dirname, '..', 'middlewares'),
    '@models': path_1.default.join(__dirname, '..', 'models'),
    '@routes': path_1.default.join(__dirname, '..', 'routes'),
    '@services': path_1.default.join(__dirname, '..', 'services'),
    '@types': path_1.default.join(__dirname, '..', 'types'),
    '@utils': path_1.default.join(__dirname, '..', 'utils'),
    '@validations': path_1.default.join(__dirname, '..', 'validations')
});
//# sourceMappingURL=module-alias.js.map