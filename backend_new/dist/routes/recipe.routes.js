"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recipeController = __importStar(require("@/controllers/recipe.controller"));
const auth_middleware_1 = require("@/middlewares/auth.middleware");
const recipe_validator_1 = require("@/validators/recipe.validator");
const router = (0, express_1.Router)();
router.get('/', recipe_validator_1.getRecipesValidator, recipeController.getAllRecipes);
router.get('/search', recipeController.searchRecipes);
router.get('/:id', recipe_validator_1.recipeIdValidator, recipeController.getRecipe);
router.use(auth_middleware_1.protect);
router.post('/', recipe_validator_1.createRecipeValidator, recipeController.createRecipe);
router.patch('/:id', recipe_validator_1.updateRecipeValidator, recipeController.updateRecipe);
router.delete('/:id', recipe_validator_1.recipeIdValidator, recipeController.deleteRecipe);
router.post('/:id/like', recipe_validator_1.recipeIdValidator, recipeController.likeRecipe);
router.post('/:id/comment', recipe_validator_1.commentValidator, recipeController.addComment);
router.post('/:id/rate', recipe_validator_1.ratingValidator, recipeController.rateRecipe);
exports.default = router;
//# sourceMappingURL=recipe.routes.js.map