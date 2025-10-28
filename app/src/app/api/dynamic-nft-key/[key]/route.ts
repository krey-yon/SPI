import { getKv } from "@/lib/kv";
import { PublicKey } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  const userPubKey = new PublicKey(params.key);
  const nftMintAddress = await getKv(`${userPubKey}-nftMintAddress`);
  
  return NextResponse.json({ nftMintAddress });
}
