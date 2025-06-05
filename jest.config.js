// ルートディレクトリのJest設定
/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  projects: [
    {
      displayName: "backend",
      rootDir: ".",
      testMatch: [
        "<rootDir>/backend/src/__tests__/**/*.test.ts",
        "<rootDir>/backend/src/__tests__/**/*.spec.ts",
        "<rootDir>/backend/src/__tests__/**/*.e2e.test.ts",
        "<rootDir>/backend/src/__tests__/**/*.integration.test.ts",
      ],
      transform: {
        "^.+\\.ts$": [
          "ts-jest",
          {
            tsconfig: "<rootDir>/backend/tsconfig.json",
          },
        ],
      },
      moduleNameMapper: {
        "^@mochiport/shared$": "<rootDir>/shared/index.ts",
        "^@mochiport/shared/(.*)$": "<rootDir>/shared/$1",
      },
      transformIgnorePatterns: ["/node_modules/(?!.*(shared)/).+\\.js$"],
      setupFilesAfterEnv: ["<rootDir>/backend/src/__tests__/setup.ts"],
      testPathIgnorePatterns: [
        "<rootDir>/backend/src/__tests__/setup.ts",
        "node_modules",
      ],
      testEnvironment: "node",
    },
    // 必要に応じて他のプロジェクトの設定を追加できます
  ],
  // 共通の設定
  verbose: true,
  collectCoverageFrom: [
    "backend/src/**/*.ts",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/__tests__/**",
  ],
  coverageDirectory: "coverage",
};

module.exports = config;
