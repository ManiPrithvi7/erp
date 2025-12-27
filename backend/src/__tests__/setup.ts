import mongoose from 'mongoose';
import { globSync } from 'glob';
import * as path from 'path';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE = process.env.TEST_DATABASE || 'mongodb://localhost:27017/idurar-test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.PORT = '8888';

// Load all model files before connecting
const modelsFiles = globSync('./src/models/**/*.ts');
for (const filePath of modelsFiles) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require(path.resolve(filePath));
}

// Global test setup
beforeAll(async () => {
  // Connect to test database
  if (mongoose.connection.readyState === 0) {
    const databaseUrl = process.env.DATABASE || 'mongodb://localhost:27017/idurar-test';
    try {
      await mongoose.connect(databaseUrl, {
        serverSelectionTimeoutMS: 5000,
      });
    } catch (error) {
      console.warn('⚠️  MongoDB connection failed. Tests requiring database will fail.');
      console.warn('   To run all tests, ensure MongoDB is running or set TEST_DATABASE env variable.');
      // Don't throw - allow tests that don't need DB to run
    }
  }
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections if connected
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      try {
        await collections[key].deleteMany({});
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
  }
}, 5000); // Timeout for cleanup

// Disconnect after all tests
afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    } catch (error) {
      // Ignore errors during cleanup
    }
  }
});

// Suppress console.log during tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
