import typescriptParser from '@typescript-eslint/parser';

/**
 * ESLint 9 フラットconfig設定 - Frontend
 * 
 * 基本的なJavaScript/TypeScript設定で、
 * プラグインの依存関係を最小限に抑えた設定
 */

export default [
  // JavaScript/TypeScript設定
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // ブラウザ環境のグローバル変数
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        history: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        // Web APIs
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        // React/Next.js基本
        React: 'readonly',
        JSX: 'readonly',
      },
    },    rules: {
      // 基本的なルールのみ（プラグインなし）
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      // any型の使用を許可
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // テストファイルの設定
  {
    files: ['src/**/*.{test,spec}.{ts,tsx,js,jsx}', 'src/__mocks__/**/*.{ts,js}'],
    languageOptions: {
      globals: {
        // Jest グローバル変数
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        // DOM testing globals
        screen: 'readonly',
        render: 'readonly',
        fireEvent: 'readonly',
        userEvent: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // テストでのconsoleログを許可
    },
  },
  // 除外パターン
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'coverage/**',
      '.turbo/**',
      '__mocks__/**',
      '*.config.{js,ts}',
    ],
  },
];
