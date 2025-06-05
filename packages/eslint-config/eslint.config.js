import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

/**
 * ESLint 9 フラットconfig形式の共有設定
 * Mochiportプロジェクト用
 */

// ベース設定（全ファイル共通）
const baseConfig = {
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    globals: {
      console: 'readonly',
      process: 'readonly',
    },
  },
  linterOptions: {
    reportUnusedDisableDirectives: true,
  },
  rules: {
    ...js.configs.recommended.rules,
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
  },
};

// TypeScript設定
const typescriptConfig = {
  files: ['**/*.{ts,tsx}'],
  plugins: {
    '@typescript-eslint': typescriptEslint,
  },
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      project: true,
      tsconfigRootDir: process.cwd(),
    },
  },
  rules: {
    ...typescriptEslint.configs.recommended.rules,
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};

// React/Next.js設定（フロントエンド用）
const reactConfig = {
  files: ['**/*.{jsx,tsx}'],
  plugins: {
    '@next/next': nextPlugin,
    'react-hooks': reactHooksPlugin,
  },
  languageOptions: {
    globals: {
      React: 'readonly',
      JSX: 'readonly',
    },
  },
  rules: {
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs['core-web-vitals'].rules,
    ...reactHooksPlugin.configs.recommended.rules,
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};

// Node.js設定（バックエンド用）
const nodeConfig = {
  files: ['**/*.{js,ts}'],
  languageOptions: {
    globals: {
      __dirname: 'readonly',
      __filename: 'readonly',
      Buffer: 'readonly',
      global: 'readonly',
      module: 'readonly',
      require: 'readonly',
      exports: 'readonly',
    },
  },
  rules: {
    'no-console': 'off', // Node.jsではconsoleログを許可
  },
};

// テストファイル設定
const testConfig = {
  files: ['**/*.{test,spec}.{js,ts,tsx}', '**/__tests__/**/*.{js,ts,tsx}'],
  languageOptions: {
    globals: {
      describe: 'readonly',
      it: 'readonly',
      test: 'readonly',
      expect: 'readonly',
      beforeEach: 'readonly',
      afterEach: 'readonly',
      beforeAll: 'readonly',
      afterAll: 'readonly',
      jest: 'readonly',
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off', // テストでのany使用を許可
    'no-console': 'off', // テストでのconsoleログを許可
  },
};

// 除外設定
const ignoreConfig = {
  ignores: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.next/**',
    '.turbo/**',
    'coverage/**',
    '*.config.js',
    '*.config.ts',
    '__mocks__/**',
  ],
};

/**
 * フロントエンド用設定エクスポート
 */
export const frontendConfig = [
  ignoreConfig,
  baseConfig,
  typescriptConfig,
  reactConfig,
  testConfig,
  prettierConfig, // Prettierとの競合を避ける（最後に配置）
];

/**
 * バックエンド用設定エクスポート
 */
export const backendConfig = [
  ignoreConfig,
  baseConfig,
  typescriptConfig,
  nodeConfig,
  testConfig,
  prettierConfig, // Prettierとの競合を避ける（最後に配置）
];

/**
 * デフォルト設定（汎用）
 */
export default [
  ignoreConfig,
  baseConfig,
  typescriptConfig,
  testConfig,
  prettierConfig,
];
