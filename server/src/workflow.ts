import type { AppConfig } from "./config.js";
import { readiness } from "./config.js";
export type Precondition={gate:string;message:string};
export function transactionPreconditions(config:AppConfig):Precondition[]{const r=readiness(config);return Object.entries(r.gates).filter(([,ok])=>!ok).map(([gate])=>({gate,message:`${gate.replaceAll("_"," ")} is not configured or verified`}))}
export function previewIntent(config:AppConfig, input:{side:"buy"|"sell";asset:string;quantityMinor:string}) { if(!/^\d+$/.test(input.quantityMinor)||BigInt(input.quantityMinor)<=0n)return{ok:false,code:"VALIDATION_ERROR",message:"Quantity must be a positive integer minor-unit string"};const missing=transactionPreconditions(config);return missing.length?{ok:false,code:"PRECONDITION_REQUIRED",message:"Financial confirmation is blocked in pre-production",missing}:{ok:true,code:"PREVIEW_READY",message:"Preview eligible; confirmation still requires authenticated command and idempotency key"} }
