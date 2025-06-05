module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  env: {
    node: true,
    es2022: true,
  },
  ignorePatterns: ["dist", "node_modules", "*.js", "**/*.test.ts", "**/*.spec.ts", "__tests__"],
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  },
};
