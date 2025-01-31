import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable TypeScript rules
      "@typescript-eslint/no-explicit-any": "off",  // Allow the use of 'any'
      "@typescript-eslint/explicit-module-boundary-types": "off",  // Allow functions without explicit return types
      "@typescript-eslint/no-unused-vars": "off",  // Turn off unused variable checks
      "@typescript-eslint/explicit-function-return-type": "off",  // Allow functions without return type
      "@typescript-eslint/no-non-null-assertion": "off",  // Allow non-null assertions (e.g., `value!`)
      "@typescript-eslint/ban-ts-comment": "off",  // Allow `@ts-ignore` comments
    },
  },
];

export default eslintConfig;
