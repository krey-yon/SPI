import { getKv } from "@/lib/kv";
import { PublicKey } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const paramsValue = await params;
  const userPubKey = new PublicKey(paramsValue.key);
  // const nftPubKey = await getKv(params.key);
  const nftMintAddress = await getKv(`${userPubKey}-nftMintAddress`);
  return NextResponse.json({ nftMintAddress });
}
