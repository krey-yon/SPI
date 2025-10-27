"use server";

import { setKv } from "@/lib/kv";

export const createReferenceKey = async (referenceId: string) => {
  const randomValue = "randomvalue"
  setKv(referenceId, randomValue);
};

export const addReferenceToAccount = async (referenceId: string, accountId: string) => {
  setKv(referenceId, accountId);
};

export const accountToAmount = async (account: string, amount: number) => {
  setKv(account, amount.toString());
};
