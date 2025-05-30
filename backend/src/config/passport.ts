import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import passport from 'passport';
import User from '@/models/User';
import { IUser } from '@/types/user.types';
import logger from '@/utils/logger';

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
};

// JWT strategy for protected routes
export const jwtStrategy = new JwtStrategy(
  jwtOptions,
  async (payload: { id: string }, done: VerifiedCallback) => {
    try {
      const user = await User.findById(payload.id).select('-password');
      
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      
      return done(null, user);
    } catch (error) {
      logger.error(`JWT Strategy Error: ${error}`);
      return done(error as Error, false);
    }
  }
);

// Serialize user into the session
export const serializeUser = () => {
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
};

// Deserialize user from the session
export const deserializeUser = () => {
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

// Initialize passport with strategies
export const initializePassport = () => {
  passport.use(jwtStrategy);
  serializeUser();
  deserializeUser();
  
  return passport.initialize();
};

export default passport;
