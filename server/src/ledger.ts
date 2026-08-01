import { randomUUID } from "node:crypto";
export type Side = "debit"|"credit";
export type LedgerEntry = { accountId:string; asset:string; side:Side; amountMinor:bigint };
export type LedgerTransaction = { id:string; state:"draft"|"pending_approval"|"posted"|"rejected"|"reversed"; entries:LedgerEntry[]; makerId:string; checkerId?:string; reversalOf?:string };
export class LedgerError extends Error { constructor(public code:string, message:string){super(message)} }
export function assertBalanced(entries: LedgerEntry[]) {
  if (entries.length < 2) throw new LedgerError("UNBALANCED", "At least two entries required");
  const totals = new Map<string,{d:bigint;c:bigint}>();
  for (const e of entries) { if(e.amountMinor<=0n) throw new LedgerError("INVALID_AMOUNT","Amounts must be positive integers"); const t=totals.get(e.asset)??{d:0n,c:0n}; e.side==="debit"?t.d+=e.amountMinor:t.c+=e.amountMinor; totals.set(e.asset,t); }
  for (const [asset,t] of totals) if(t.d!==t.c) throw new LedgerError("UNBALANCED",`Entries do not balance for ${asset}`);
}
export class LedgerService {
  private transactions = new Map<string,LedgerTransaction>(); private idem = new Map<string,string>(); private balances = new Map<string,bigint>();
  seedBalance(accountId:string,asset:string,amount:bigint){this.balances.set(`${accountId}:${asset}`,amount)}
  createPending(input:{entries:LedgerEntry[];makerId:string;idempotencyKey:string}):LedgerTransaction { const replay=this.idem.get(input.idempotencyKey); if(replay)return this.transactions.get(replay)!; assertBalanced(input.entries); const tx:LedgerTransaction={id:randomUUID(),state:"pending_approval",entries:input.entries,makerId:input.makerId}; this.transactions.set(tx.id,tx);this.idem.set(input.idempotencyKey,tx.id);return tx }
  approveAndPost(id:string,checkerId:string){const tx=this.transactions.get(id);if(!tx)throw new LedgerError("NOT_FOUND","Transaction not found");if(tx.makerId===checkerId)throw new LedgerError("MAKER_CHECKER","Maker cannot approve own transaction");if(tx.state!=="pending_approval")throw new LedgerError("INVALID_STATE","Transaction is not pending");for(const e of tx.entries.filter(e=>e.side==="debit")){const k=`${e.accountId}:${e.asset}`;if((this.balances.get(k)??0n)<e.amountMinor)throw new LedgerError("INSUFFICIENT_BALANCE","Negative available balance denied")};for(const e of tx.entries){const k=`${e.accountId}:${e.asset}`,v=this.balances.get(k)??0n;this.balances.set(k,e.side==="debit"?v-e.amountMinor:v+e.amountMinor)}tx.state="posted";tx.checkerId=checkerId;return tx}
  reverse(id:string,makerId:string,key:string){const original=this.transactions.get(id);if(!original||original.state!=="posted")throw new LedgerError("INVALID_STATE","Only posted transactions can be reversed");const entries=original.entries.map(e=>({...e,side:(e.side==="debit"?"credit":"debit") as Side}));const reversal=this.createPending({entries,makerId,idempotencyKey:key});reversal.reversalOf=id;return reversal}
}
