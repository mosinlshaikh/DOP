import type { MarketOracle, ProviderResult } from "./providers.js";

const symbols = new Set(["USOIL", "UKOIL", "XNGUSD"] as const);
const allowedOrigins = new Set(["https://api.realmarketapi.com"]);
type SymbolName = "USOIL" | "UKOIL" | "XNGUSD";
type FetchLike = typeof fetch;
type OfficialPrice = {
  SymbolCode?: unknown;
  ClosePrice?: unknown;
  OpenTime?: unknown;
  Bid?: unknown;
  Ask?: unknown;
  Source?: unknown;
};

export class RealMarketOracle implements MarketOracle {
  private readonly base: URL;
  constructor(
    private readonly apiKey: string,
    baseUrl = "https://api.realmarketapi.com",
    private readonly maxAgeMs = 120_000,
    private readonly now = () => Date.now(),
    private readonly fetchImpl: FetchLike = fetch,
  ) {
    const parsed = new URL(baseUrl);
    if (!allowedOrigins.has(parsed.origin) || parsed.protocol !== "https:") {
      throw new Error("Oracle base URL is not allowlisted");
    }
    this.base = new URL(parsed.origin);
  }

  async quote(
    symbol: SymbolName,
  ): Promise<
    ProviderResult<{
      priceMinor: bigint;
      precision: number;
      asOf: Date;
      source: string;
    }>
  > {
    if (!symbols.has(symbol))
      return { ok: false, code: "DENIED", reason: "Symbol not allowlisted" };
    const url = new URL("/api/v1/price", this.base);
    url.searchParams.set("apiKey", this.apiKey);
    url.searchParams.set("symbolCode", symbol);
    url.searchParams.set("timeFrame", "M1");
    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      return { ok: false, code: "DENIED", reason: "Oracle request failed" };
    }
    if (!response.ok)
      return { ok: false, code: "DENIED", reason: "Oracle request rejected" };
    let body: OfficialPrice;
    try {
      body = (await response.json()) as OfficialPrice;
    } catch {
      return { ok: false, code: "DENIED", reason: "Oracle response invalid" };
    }
    if (body.SymbolCode !== symbol)
      return { ok: false, code: "DENIED", reason: "Oracle symbol mismatch" };
    const decimal = exactDecimal(body.ClosePrice);
    if (!decimal)
      return { ok: false, code: "DENIED", reason: "Oracle price invalid" };
    const asOf = parseOpenTime(body.OpenTime);
    if (
      !asOf ||
      this.now() - asOf.valueOf() > this.maxAgeMs ||
      asOf.valueOf() > this.now() + 10_000
    )
      return {
        ok: false,
        code: "STALE_DATA",
        reason: "Oracle quote is stale or future-dated",
      };
    const precision = Math.min(8, Math.max(2, decimal.fraction.length));
    const priceMinor =
      BigInt(decimal.whole) * 10n ** BigInt(precision) +
      BigInt(decimal.fraction.padEnd(precision, "0").slice(0, precision));
    return {
      ok: true,
      value: {
        priceMinor,
        precision,
        asOf,
        source:
          typeof body.Source === "string" && body.Source.length <= 80
            ? body.Source
            : "RealMarketAPI",
      },
    };
  }
}

function exactDecimal(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value);
  if (!/^\d+(\.\d+)?$/.test(text) || Number(text) <= 0) return null;
  const [whole = "0", fraction = ""] = text.split(".");
  return { whole, fraction };
}

function parseOpenTime(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const date =
    typeof value === "number"
      ? new Date(value < 10_000_000_000 ? value * 1000 : value)
      : new Date(value);
  return Number.isFinite(date.valueOf()) ? date : null;
}

export function validateUsdUsdt(
  rateScaled: bigint,
  precision: number,
  asOf: Date,
  previous?: bigint,
  now = Date.now(),
): ProviderResult<{ rateScaled: bigint; precision: number; asOf: Date }> {
  if (precision < 4 || precision > 12 || rateScaled <= 0n)
    return { ok: false, code: "DENIED", reason: "Invalid conversion precision" };
  if (now - asOf.valueOf() > 120_000)
    return { ok: false, code: "STALE_DATA", reason: "Conversion is stale" };
  if (previous) {
    const delta = rateScaled > previous ? rateScaled - previous : previous - rateScaled;
    if (delta * 100n > previous * 5n)
      return { ok: false, code: "DENIED", reason: "Conversion deviation exceeds 5%" };
  }
  return { ok: true, value: { rateScaled, precision, asOf } };
}
