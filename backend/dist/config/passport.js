"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializePassport = exports.deserializeUser = exports.serializeUser = exports.jwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = __importDefault(require("passport"));
const User_1 = __importDefault(require("@/models/User"));
const logger_1 = __importDefault(require("@/utils/logger"));
const jwtOptions = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
};
// JWT strategy for protected routes
exports.jwtStrategy = new passport_jwt_1.Strategy(jwtOptions, async (payload, done) => {
    try {
        const user = await User_1.default.findById(payload.id).select('-password');
        if (!user) {
            return done(null, false, { message: 'User not found' });
        }
        return done(null, user);
    }
    catch (error) {
        logger_1.default.error(`JWT Strategy Error: ${error}`);
        return done(error, false);
    }
});
// Serialize user into the session
const serializeUser = () => {
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
};
exports.serializeUser = serializeUser;
// Deserialize user from the session
const deserializeUser = () => {
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await User_1.default.findById(id);
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    });
};
exports.deserializeUser = deserializeUser;
// Initialize passport with strategies
const initializePassport = () => {
    passport_1.default.use(exports.jwtStrategy);
    (0, exports.serializeUser)();
    (0, exports.deserializeUser)();
    return passport_1.default.initialize();
};
exports.initializePassport = initializePassport;
exports.default = passport_1.default;
