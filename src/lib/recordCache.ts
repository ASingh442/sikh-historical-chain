// src/lib/recordCache.ts
import { Contract } from "ethers";

const recordCache = new Map<number, any>();

export async function getRecordCached(contract: Contract, id: number) {
  if (recordCache.has(id)) return recordCache.get(id);

  const record = await contract.getRecord(id);
  recordCache.set(id, record);
  return record;
}