import { z } from "zod";

const bool = z.enum(["true", "false"]).default("false").transform(v => v === "true");
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  DATABASE_URL: z.string().min(1).optional(),
  CORS_ORIGINS: z.string().default("http://localhost:5173"),
  ACCESS_TOKEN_SECRET: z.string().min(32).optional(),
  REALMARKET_API_KEY: z.string().min(1).optional(),
  MARKET_ORACLE_ENABLED: bool, CONVERSION_ORACLE_ENABLED: bool,
  KYC_PROVIDER_ENABLED: bool, SANCTIONS_PROVIDER_ENABLED: bool,
  CUSTODY_PROVIDER_ENABLED: bool, HSM_KMS_ENABLED: bool,
  LICENCE_VERIFIED: bool, FEES_CONFIGURED: bool,
  INVENTORY_ATTESTATION_ENABLED: bool, RECONCILIATION_HEALTHY: bool
});
export type AppConfig = ReturnType<typeof loadConfig>;
export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const config = schema.parse(env);
  if (config.NODE_ENV === "production") {
    const missing = [
      !config.DATABASE_URL && "DATABASE_URL", !config.ACCESS_TOKEN_SECRET && "ACCESS_TOKEN_SECRET",
      !config.LICENCE_VERIFIED && "LICENCE_VERIFIED", !config.KYC_PROVIDER_ENABLED && "KYC_PROVIDER_ENABLED",
      !config.SANCTIONS_PROVIDER_ENABLED && "SANCTIONS_PROVIDER_ENABLED", !config.CUSTODY_PROVIDER_ENABLED && "CUSTODY_PROVIDER_ENABLED",
      !config.HSM_KMS_ENABLED && "HSM_KMS_ENABLED", !config.FEES_CONFIGURED && "FEES_CONFIGURED",
      !config.INVENTORY_ATTESTATION_ENABLED && "INVENTORY_ATTESTATION_ENABLED"
    ].filter(Boolean);
    if (missing.length) throw new Error(`Production startup refused; missing gates: ${missing.join(", ")}`);
  }
  return config;
}
export function readiness(c: AppConfig) {
  const gates = {
    database: Boolean(c.DATABASE_URL), migrations: false,
    oracle: c.MARKET_ORACLE_ENABLED && Boolean(c.REALMARKET_API_KEY), conversion: c.CONVERSION_ORACLE_ENABLED,
    kyc: c.KYC_PROVIDER_ENABLED, sanctions: c.SANCTIONS_PROVIDER_ENABLED, custody: c.CUSTODY_PROVIDER_ENABLED,
    hsm_kms: c.HSM_KMS_ENABLED, licence_verification: c.LICENCE_VERIFIED, fees: c.FEES_CONFIGURED,
    inventory_attestation: c.INVENTORY_ATTESTATION_ENABLED, reconciliation: c.RECONCILIATION_HEALTHY
  };
  return { mode: "pre-production" as const, transactionReady: Object.values(gates).every(Boolean), gates };
}
