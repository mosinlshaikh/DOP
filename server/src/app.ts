import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { z } from "zod";
import type { AppConfig } from "./config.js";
import { readiness } from "./config.js";
import { previewIntent } from "./workflow.js";
import { AuditChain } from "./audit.js";

export async function buildApp(config:AppConfig){
  const app=Fastify({logger:{level:config.NODE_ENV==="test"?"silent":"info",redact:["req.headers.authorization","req.headers.cookie","body.password","body.token","body.apiKey"]},requestIdHeader:"x-request-id",bodyLimit:64*1024});
  await app.register(helmet,{contentSecurityPolicy:false});
  await app.register(cors,{origin:(origin,cb)=>{const allowed=config.CORS_ORIGINS.split(",").map(x=>x.trim());cb(null,!origin||allowed.includes(origin))},credentials:true});
  await app.register(rateLimit,{max:100,timeWindow:"1 minute"});
  const audit=new AuditChain();
  app.get("/health/live",async()=>({status:"ok",process:"live"}));
  app.get("/health/ready",async(_req,reply)=>{const r=readiness(config);return reply.code(r.transactionReady?200:503).send(r)});
  app.get("/api/v1/status",async()=>readiness(config));
  app.get("/api/v1/session",async(_req,reply)=>reply.code(401).send({code:"AUTH_PROVIDER_UNCONFIGURED",message:"Authoritative server session is unavailable"}));
  const intent=z.object({side:z.enum(["buy","sell"]),asset:z.enum(["USD","USDT","DCO_BBL"]),quantityMinor:z.string().regex(/^\d+$/)});
  app.post("/api/v1/trade-intents/preview",async(req,reply)=>{const parsed=intent.safeParse(req.body);if(!parsed.success)return reply.code(400).send({code:"VALIDATION_ERROR",message:"Invalid request"});const result=previewIntent(config,parsed.data);audit.append({id:crypto.randomUUID(),occurredAt:new Date().toISOString(),actorId:"anonymous-preproduction",action:"trade_intent.preview",metadata:{side:parsed.data.side,asset:parsed.data.asset,outcome:result.code}});return reply.code(result.ok?200:412).send(result)});
  app.post("/api/v1/trade-intents/confirm",async(req,reply)=>{if(!req.headers["idempotency-key"])return reply.code(400).send({code:"IDEMPOTENCY_KEY_REQUIRED",message:"Idempotency-Key header is required"});return reply.code(412).send({code:"PRECONDITION_REQUIRED",message:"Confirmation is fail-closed until licence, compliance, fees, custody, signing, oracle and backing gates are verified",missing:transactionGateNames(config)})});
  app.post("/api/v1/withdrawals",async(_req,reply)=>reply.code(412).send({code:"PRECONDITION_REQUIRED",message:"Withdrawals are disabled in pre-production"}));
  app.get("/api/v1/audit/verify",async()=>({valid:audit.verify(),scope:"in-process pre-production chain"}));
  app.setErrorHandler((error,req,reply)=>{req.log.error({err:error},"request failed");const status=typeof error==="object"&&error!==null&&"statusCode" in error&&typeof error.statusCode==="number"&&error.statusCode<500?error.statusCode:500;reply.code(status).send({code:"REQUEST_FAILED",message:"Request could not be completed",requestId:req.id})});
  return app;
}
const transactionGateNames=(c:AppConfig)=>Object.entries(readiness(c).gates).filter(([,ok])=>!ok).map(([gate])=>gate);
