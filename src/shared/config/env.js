function requireEnv(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value == null || value === "") throw new Error(`Missing env var: ${name}`);
  return value;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT ? Number(process.env.PORT) : 3001,
  JWT_SECRET: requireEnv("JWT_SECRET", "dev_only_change_me"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
  DB_HOST: requireEnv("DB_HOST", undefined),
  DB_PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  DB_NAME: requireEnv("DB_NAME", undefined),
  DB_USER: requireEnv("DB_USER", undefined),
  DB_PASSWORD: requireEnv("DB_PASSWORD", undefined),
  DATABASE_URL: process.env.DATABASE_URL || "",
};

module.exports = { env };

