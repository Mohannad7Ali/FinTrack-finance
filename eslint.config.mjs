import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierRecommended, // هذا السطر يدمج Prettier ويلغي أي تعارض مع قواعد ESLint الأخرى
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'lib/generated/**', // تجاهل مجلد Prisma تماماً
  ]),
]);

export default eslintConfig;
