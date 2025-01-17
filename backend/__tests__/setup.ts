// __tests__/setup.ts
import { jest, beforeEach, afterAll } from '@jest/globals';

// Mock console.error for cleaner test output
jest.spyOn(console, 'error').mockImplementation(() => {});

// Reset all mocks automatically between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  jest.restoreAllMocks();
});