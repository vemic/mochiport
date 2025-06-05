module.exports = {
  extends: [
    "next/core-web-vitals",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "prefer-const": "error",
    "no-var": "error"
  },
  settings: {
    react: {
      version: "detect"
    }
  }
};
