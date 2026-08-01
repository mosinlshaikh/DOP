import test from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
test("status distinguishes liveness from transaction readiness", async () => {
  const app = await buildApp(loadConfig({ NODE_ENV: "test" }));
  const live = await app.inject({ method: "GET", url: "/health/live" });
  assert.equal(live.statusCode, 200);
  const ready = await app.inject({ method: "GET", url: "/health/ready" });
  assert.equal(ready.statusCode, 503);
  assert.equal(ready.json().transactionReady, false);
  await app.close();
});
test("financial confirmation requires idempotency and then fails preconditions", async () => {
  const app = await buildApp(loadConfig({ NODE_ENV: "test" }));
  const noKey = await app.inject({
    method: "POST",
    url: "/api/v1/trade-intents/confirm",
    payload: {},
  });
  assert.equal(noKey.statusCode, 400);
  const blocked = await app.inject({
    method: "POST",
    url: "/api/v1/trade-intents/confirm",
    headers: { "idempotency-key": "test-command-1" },
    payload: {},
  });
  assert.equal(blocked.statusCode, 412);
  assert.equal(blocked.json().code, "PRECONDITION_REQUIRED");
  await app.close();
});
test("authoritative session fails closed while auth provider is unconfigured", async () => {
  const app = await buildApp(loadConfig({ NODE_ENV: "test" }));
  const session = await app.inject({ method: "GET", url: "/api/v1/session" });
  assert.equal(session.statusCode, 401);
  assert.equal(session.json().code, "AUTH_PROVIDER_UNCONFIGURED");
  await app.close();
});
