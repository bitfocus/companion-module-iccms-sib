import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'
import globals from 'globals'

const baseConfig = await generateEslintConfig({})

const customConfig = [
	...baseConfig,
	{
		languageOptions: {
			sourceType: 'module',
		},
	},
	{
		files: ['vitest.config.mjs'],
		rules: {
			'n/no-unpublished-import': ['error', { allowModules: ['vitest'] }],
		},
	},
	{
		files: ['test/**/*.js', '**/*.test.js'],
		languageOptions: {
			globals: {
				...globals.jest,
				vi: 'readonly',
			},
		},
		rules: {
			'n/no-unpublished-import': ['error', { allowModules: ['efate', '@faker-js/faker', 'semver'] }],
		},
	},
]

export default customConfig
