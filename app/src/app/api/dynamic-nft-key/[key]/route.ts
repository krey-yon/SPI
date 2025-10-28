import { getKv } from "@/lib/kv";
import { PublicKey } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: { key: string } | Promise<{ key: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const paramsValue = await context.params;
  const userPubKey = new PublicKey(paramsValue.key);

  const nftMintAddress = await getKv(`${userPubKey}-nftMintAddress`);
  return NextResponse.json({ nftMintAddress });
}
