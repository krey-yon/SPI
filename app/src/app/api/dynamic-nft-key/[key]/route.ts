import { getKv } from "@/lib/kv";
import { PublicKey } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params; // ✅ await the Promise directly here

  const userPubKey = new PublicKey(key);
  const nftMintAddress = await getKv(`${userPubKey}-nftMintAddress`);

  return NextResponse.json({ nftMintAddress });
}
