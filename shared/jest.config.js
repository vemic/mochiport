/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: [
    "**/__tests__/**/*.ts",
    "**/?(*.)+(spec|test).ts"
  ],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: "<rootDir>/tsconfig.json"
    }]
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },
  testPathIgnorePatterns: [
    "node_modules",
    "dist"
  ],
  moduleFileExtensions: ["ts", "js", "json", "node"]
};

module.exports = config;
