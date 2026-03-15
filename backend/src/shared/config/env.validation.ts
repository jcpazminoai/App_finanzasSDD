type EnvVars = Record<string, string | undefined>;

export function validateEnv(config: EnvVars): EnvVars {
  const requiredKeys = [
    'DATABASE_URL',
    'AUTH_TOKEN_SECRET',
    'AUTH_TOKEN_TTL_SECONDS'
  ];

  for (const key of requiredKeys) {
    if (!config[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return config;
}
