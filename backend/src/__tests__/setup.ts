// Test setup file for backend tests

// Jest is already available globally in the test environment
// No need to import it from '@jest/globals'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.AZURE_COSMOS_CONNECTION_STRING = 'mock-connection-string'

// Set timeout for async tests
jest.setTimeout(10000)
