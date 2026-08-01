import test from "node:test";
import assert from "node:assert/strict";
import { RealMarketOracle } from "../src/oracle.js";

const fixedNow = Date.parse("2026-08-02T10:00:00.000Z");
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

test("uses documented price URL contract and parses official fields", async () => {
  let requested: URL | undefined;
  const mockFetch = (async (input: URL | RequestInfo) => {
    requested = new URL(String(input));
    return json({
      SymbolCode: "USOIL",
      ClosePrice: 78.125,
      OpenTime: "2026-08-02T09:59:30.000Z",
      Bid: 78.12,
      Ask: 78.13,
      Source: "RealMarketAPI",
    });
  }) as typeof fetch;
  const oracle = new RealMarketOracle(
    "test-secret-never-logged",
    "https://api.realmarketapi.com",
    120_000,
    () => fixedNow,
    mockFetch,
  );
  const result = await oracle.quote("USOIL");
  assert.equal(requested?.pathname, "/api/v1/price");
  assert.equal(requested?.searchParams.get("apiKey"), "test-secret-never-logged");
  assert.equal(requested?.searchParams.get("symbolCode"), "USOIL");
  assert.equal(requested?.searchParams.get("timeFrame"), "M1");
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.priceMinor, 78125n);
    assert.equal(result.value.precision, 3);
  }
});

test("rejects mismatched response symbol", async () => {
  const mockFetch = (async () =>
    json({
      SymbolCode: "UKOIL",
      ClosePrice: "80.25",
      OpenTime: "2026-08-02T09:59:30.000Z",
    })) as typeof fetch;
  const result = await new RealMarketOracle(
    "secret",
    undefined,
    120_000,
    () => fixedNow,
    mockFetch,
  ).quote("USOIL");
  assert.deepEqual(result, {
    ok: false,
    code: "DENIED",
    reason: "Oracle symbol mismatch",
  });
});

test("rejects a non-allowlisted requested symbol before fetch", async () => {
  let called = false;
  const mockFetch = (async () => {
    called = true;
    return json({});
  }) as typeof fetch;
  const oracle = new RealMarketOracle(
    "secret",
    undefined,
    120_000,
    () => fixedNow,
    mockFetch,
  );
  const result = await oracle.quote("GOLD" as never);
  assert.equal(result.ok, false);
  assert.equal(called, false);
});

test("rejects stale official response", async () => {
  const mockFetch = (async () =>
    json({
      SymbolCode: "USOIL",
      ClosePrice: "78.1250",
      OpenTime: "2026-08-02T09:50:00.000Z",
    })) as typeof fetch;
  const result = await new RealMarketOracle(
    "secret",
    undefined,
    120_000,
    () => fixedNow,
    mockFetch,
  ).quote("USOIL");
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "STALE_DATA");
});

test("returns generic error on HTTP rejection", async () => {
  const mockFetch = (async () => json({ providerDetail: "sensitive" }, 403)) as typeof fetch;
  const result = await new RealMarketOracle(
    "secret",
    undefined,
    120_000,
    () => fixedNow,
    mockFetch,
  ).quote("USOIL");
  assert.deepEqual(result, {
    ok: false,
    code: "DENIED",
    reason: "Oracle request rejected",
  });
});

test("refuses unallowlisted base URL before any request", () => {
  assert.throws(
    () => new RealMarketOracle("secret", "https://example.invalid"),
    /not allowlisted/,
  );
});
