import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User, { IUser } from '../User';

// Create a new in-memory database before running any tests
let mongoServer: MongoMemoryServer;

// Test user data
const testUserData = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'user',
};

describe('User Model', () => {
  // Connect to the in-memory database before running tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  // Clear all test data after each test
  afterEach(async () => {
    await User.deleteMany({});
  });

  // Disconnect from the in-memory database after all tests are done
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Test creating a new user
  it('should create a new user', async () => {
    const user: IUser = new User(testUserData);
    const savedUser = await user.save();
    
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(testUserData.name);
    expect(savedUser.email).toBe(testUserData.email);
    expect(savedUser.role).toBe(testUserData.role);
    expect(savedUser.password).not.toBe(testUserData.password); // Password should be hashed
  });

  // Test required fields
  it('should require name, email, and password', async () => {
    const user = new User({});
    
    let error: mongoose.Error.ValidationError | null = null;
    try {
      await user.validate();
    } catch (err) {
      error = err as mongoose.Error.ValidationError;
    }
    
    expect(error).toBeDefined();
    expect(error?.errors['name']).toBeDefined();
    expect(error?.errors['email']).toBeDefined();
    expect(error?.errors['password']).toBeDefined();
  });

  // Test unique email
  it('should not allow duplicate emails', async () => {
    // Create first user
    const user1 = new User(testUserData);
    await user1.save();
    
    // Try to create second user with same email
    const user2 = new User({
      ...testUserData,
      name: 'Another User',
    });
    
    let error: any;
    try {
      await user2.save();
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // Duplicate key error
  });

  // Test password hashing
  it('should hash the password before saving', async () => {
    const user = new User(testUserData);
    await user.save();
    
    expect(user.password).not.toBe(testUserData.password);
    expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
  });

  // Test password comparison
  it('should compare passwords correctly', async () => {
    const user = new User(testUserData);
    await user.save();
    
    const isMatch = await user.matchPassword(testUserData.password);
    expect(isMatch).toBe(true);
    
    const isNotMatch = await user.matchPassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });

  // Test JWT token generation
  it('should generate a valid JWT token', () => {
    // Mock environment variables
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRE = '1h';
    
    const user = new User(testUserData);
    const token = user.getSignedJwtToken();
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // JWT has 3 parts
  });
});
