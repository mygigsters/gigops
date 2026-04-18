/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/tests/**/*.test.ts', '**/src/providers/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/src/__tests__/'],
  moduleFileExtensions: ['ts', 'js', 'json'],
};
