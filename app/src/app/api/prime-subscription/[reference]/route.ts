import { NextRequest, NextResponse } from "next/server";
import { RECIPIENT, FEE_COLLECTOR, AMOUNT_SOL, RPC_URL } from "@/app/constant";
import * as anchor from "@coral-xyz/anchor";
import idl from "../../../../../idl.json";
import { Spi } from "../../../../../spi";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { findReference } from "@solana/pay";
import { handleBuyPrime } from "@/actions/premium";
import { createNft } from "@/actions/nft";

// Create Solana connection
const connection = new Connection(RPC_URL, "confirmed");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const provider = new anchor.AnchorProvider(connection, {} as any, {});
const program = new anchor.Program(
  idl as anchor.Idl,
  provider
) as anchor.Program<Spi>;

export async function GET(
  req: NextRequest,
  { params }: { params: { reference: string } }
) {
  console.log("==========================================");
  console.log("GET request received");
  console.log("Reference:", params.reference);
  console.log("Headers:", Object.fromEntries(req.headers.entries()));
  console.log("==========================================");

  return NextResponse.json({
    label: "My Store",
    icon: "https://solanapay.com/src/img/branding/Solanapay-logo-with-text.png",
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ reference: string }> }
) {
  console.log("==========================================");
  console.log("POST /api/pay/:reference");

  try {
    const body = await req.json();

    // ✅ Await the promise for params
    const { reference } = await context.params;

    console.log("Body:", body);
    console.log("Reference:", reference);

    const account = body?.account;
    if (!account) {
      return NextResponse.json(
        { error: "Account required in body" },
        { status: 400 }
      );
    }
    if (!reference) {
      return NextResponse.json(
        { error: "Reference required in URL" },
        { status: 400 }
      );
    }

    console.log("✅ Sender:", account);
    console.log("✅ Reference:", reference);

    const senderPubkey = new PublicKey(account);
    const recipientPubkey = new PublicKey(RECIPIENT);
    const feeCollectorPubkey = new PublicKey(FEE_COLLECTOR);
    const referencePubkey = new PublicKey(reference);

    const lamports = AMOUNT_SOL * LAMPORTS_PER_SOL;

    console.log("✅ Transfer details:");
    console.log("  - Amount:", lamports, "lamports");
    console.log("  - Sender:", senderPubkey.toBase58());
    console.log("  - Recipient:", recipientPubkey.toBase58());
    console.log("  - Fee Collector:", feeCollectorPubkey.toBase58());

    const ix = await program.methods
      .transfer(new anchor.BN(lamports))
      .accounts({
        sender: senderPubkey,
        recipient: recipientPubkey,
        feeCollector: feeCollectorPubkey,
      })
      .instruction(); // <-- builds the correct Instruction

    ix.keys.push({
      pubkey: referencePubkey,
      isSigner: false,
      isWritable: false,
    });

    const { blockhash } = await connection.getLatestBlockhash();
    const message = new anchor.web3.TransactionMessage({
      payerKey: senderPubkey,
      recentBlockhash: blockhash,
      instructions: [ix],
    }).compileToV0Message();

    const transaction = new anchor.web3.VersionedTransaction(message);
    const base64 = Buffer.from(transaction.serialize()).toString("base64");

    //pollAndUpdateStatus
    pollAndGrantSubAndASA(account, reference);
    return NextResponse.json({
      transaction: base64,
      message: `Transfer ${AMOUNT_SOL} LAMPORTS_PER_SOL
      ).toFixed(3)} SOL)`,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      {
        error: "Failed to create transaction",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

const pollAndGrantSubAndASA = async (
  reference: string,
  accountPubkey: string,
  pollInterval = 2000,
  maxAttempts = 30
) => {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const tx = await findReference(connection, new PublicKey(reference), {
        finality: "confirmed",
      });
      if (tx.signature) {
        console.log("🎯 Transaction confirmed on-chain");

        handleBuyPrime(accountPubkey);
        createNft(accountPubkey);
        break;
      }
      return;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error name: ${error.name}, message: ${error.message}`);
      } else {
        console.log(`⏳ Transaction not found yet, attempt ${attempts + 1}`);
      }
    }

    await new Promise((res) => setTimeout(res, pollInterval));
    attempts++;
  }
};
