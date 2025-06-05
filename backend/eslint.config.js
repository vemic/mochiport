import { backendConfig } from '@mochiport/eslint-config';

/**
 * ESLint 9 フラットconfig設定 - Backend
 * 
 * @mochiport/eslint-config のbackendConfig を使用して、
 * Node.js/TypeScript環境に最適化された設定を適用
 */
export default [
  ...backendConfig,
  // Backend固有の設定調整
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        // Node.js環境のグローバル変数
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        crypto: 'readonly',
        Buffer: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      // 現在の.eslintrc.jsの設定を維持
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      // Node.js環境でのconsole使用を許可
      'no-console': 'off',
    },
  },  // テストファイルの設定を調整
  {
    files: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/__tests__/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: null, // テストファイルではプロジェクト参照を無効化
      },
      globals: {
        // Node.js環境のグローバル変数
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        crypto: 'readonly',
        Buffer: 'readonly',
        process: 'readonly',
        console: 'readonly',
        // Web API グローバル変数（テスト環境用）
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
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
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
    },
  },
  // 除外パターンを明示的に設定
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.js',
      '__tests__/**',
    ],
  },
];
