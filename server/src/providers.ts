export type ProviderResult<T> = { ok: true; value: T } | { ok: false; code: "PROVIDER_UNCONFIGURED" | "STALE_DATA" | "DENIED"; reason: string };
export interface MarketOracle { quote(symbol: "USOIL"|"UKOIL"|"XNGUSD"): Promise<ProviderResult<{ priceMinor: bigint; precision: number; asOf: Date; source: string }>> }
export interface ConversionOracle { usdPerUsdt(): Promise<ProviderResult<{ rateScaled: bigint; precision: number; asOf: Date }>> }
export interface ComplianceProvider { verify(userId: string): Promise<ProviderResult<{ kyc: "approved"; sanctions: "clear" }>> }
export interface CustodyProvider { createInstruction(command: unknown): Promise<ProviderResult<{ providerReference: string }>> }
export interface SigningProvider { signDigest(digest: string): Promise<ProviderResult<{ signatureReference: string }>> }
export interface InventoryAttestationProvider { available(asset: "DCO_BBL", quantityMinor: bigint): Promise<ProviderResult<{ attestationReference: string; asOf: Date }>> }
const denied = async (): Promise<ProviderResult<never>> => ({ ok:false, code:"PROVIDER_UNCONFIGURED", reason:"Provider is not configured" });
export const disabledProviders = {
  market: { quote: denied } as MarketOracle, conversion: { usdPerUsdt: denied } as ConversionOracle,
  compliance: { verify: denied } as ComplianceProvider, custody: { createInstruction: denied } as CustodyProvider,
  signing: { signDigest: denied } as SigningProvider, inventory: { available: denied } as InventoryAttestationProvider
};
