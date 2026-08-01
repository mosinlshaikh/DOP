import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
const scrypt=promisify(scryptCallback);
export async function hashPassword(password:string){if(password.length<12)throw new Error("Password policy rejected");const salt=randomBytes(16);const derived=await scrypt(password,salt,64) as Buffer;return`scrypt$${salt.toString("hex")}$${derived.toString("hex")}`}
export async function verifyPassword(password:string,encoded:string){const [kind,saltHex,hashHex]=encoded.split("$");if(kind!=="scrypt"||!saltHex||!hashHex)return false;const expected=Buffer.from(hashHex,"hex"),actual=await scrypt(password,Buffer.from(saltHex,"hex"),expected.length) as Buffer;return expected.length===actual.length&&timingSafeEqual(expected,actual)}
export const hashRefreshToken=(token:string)=>createHash("sha256").update(token).digest("hex");
export interface RefreshSessionStore { rotate(input:{currentTokenHash:string;newTokenHash:string;expiresAt:Date}):Promise<{userId:string;roles:string[]} | null>; revokeFamily(tokenHash:string):Promise<void> }
export type AuthPrincipal={userId:string;roles:Array<"customer"|"supplier"|"compliance"|"finance"|"admin"|"super_admin">};
export interface AccessTokenIssuer { issue(principal:AuthPrincipal,ttlSeconds:number):Promise<{token:string;expiresAt:Date}>; verify(token:string):Promise<AuthPrincipal|null> }
export const disabledTokenIssuer:AccessTokenIssuer={async issue(){throw new Error("Authentication signing provider is not configured")},async verify(){return null}};
export function requireRole(principal:AuthPrincipal|undefined,allowed:AuthPrincipal["roles"]){if(!principal||!principal.roles.some(r=>allowed.includes(r)))throw Object.assign(new Error("Forbidden"),{statusCode:403})}
