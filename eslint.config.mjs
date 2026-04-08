import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	prettierRecommended,

	globalIgnores([
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
		'lib/generated/**', // تجاهل مجلد Prisma تماماً
	]),

	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		rules: {
			// 1. إيقاف تنبيهات المتغيرات غير المستخدمة و any
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',

			// 2. إيقاف الوعود العائمة وقواعد أخرى
			'@typescript-eslint/no-floating-promises': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/restrict-template-expressions': 'off',

			// 3. إعداد Prettier ليتوافق مع .prettierrc
			'prettier/prettier': [
				'error',
				{
					useTabs: true,
					tabWidth: 2,
					endOfLine: 'auto',
					singleQuote: true,
					semi: true,
				},
			],
		},
	},
]);

export default eslintConfig;
