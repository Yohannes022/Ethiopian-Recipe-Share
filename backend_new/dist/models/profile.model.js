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
const mongoose_1 = __importStar(require("mongoose"));
const profileSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    bio: {
        type: String,
        maxlength: 500,
    },
    location: {
        type: String,
        maxlength: 100,
    },
    website: {
        type: String,
        maxlength: 200,
    },
    profilePicture: {
        data: Buffer,
        contentType: String
    },
    social: {
        facebook: {
            type: String,
            maxlength: 200,
        },
        twitter: {
            type: String,
            maxlength: 200,
        },
        instagram: {
            type: String,
            maxlength: 200,
        },
        youtube: {
            type: String,
            maxlength: 200,
        },
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
profileSchema.virtual('profilePictureUrl').get(function () {
    if (this.profilePicture?.data) {
        return `/api/v1/profiles/${this._id}/picture`;
    }
    return null;
});
profileSchema.index({ user: 1 }, { unique: true });
const Profile = mongoose_1.default.model('Profile', profileSchema);
exports.default = Profile;
//# sourceMappingURL=profile.model.js.map