// env.ts
// Utility to access environment variables in a type-safe way

function getEnvVar(key: string, defaultValue?: string): string {
	const value = process.env[key];
	if (value === undefined || value === null) {
		if (defaultValue !== undefined) {
			return defaultValue;
		}
		throw new Error(`Environment variable ${key} is required but not set.`);
	}
	return value;
}

export const ENV = {
	NODE_ENV: getEnvVar('NODE_ENV', 'development'),
	get IS_PRODUCTION() {
		return this.NODE_ENV === 'production';
	},
	PORT: getEnvVar('PORT', '3000'),
	OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
	DATABASE_URL: getEnvVar('DATABASE_URL'),

};

export { getEnvVar }; 