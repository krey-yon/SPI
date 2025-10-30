import { NextRequest, NextResponse } from "next/server";
import { RECIPIENT, FEE_COLLECTOR, RPC_URL } from "@/app/constant";
import * as anchor from "@coral-xyz/anchor";
import idl from "../../../../../idl.json";
import { Spi } from "../../../../../spi";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { mintSPI } from "@/actions/reward";
import { findReference } from "@solana/pay";
import { accountToAmount, addReferenceToAccount } from "@/actions/db";
import { getKv } from "@/lib/kv";
import { findUserAsaPda, getSolPrice, updateAsa } from "@/utils/helper";
import { readUserAsaPdaData } from "@/utils/parsePda";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

const connection = new Connection(RPC_URL, "confirmed");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const provider = new anchor.AnchorProvider(connection, {} as any, {});
const program = new anchor.Program(idl as anchor.Idl, provider) as anchor.Program<Spi>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function logStep(step: string, data?: any) {
  console.log(`\n🪵 [${new Date().toISOString()}] ${step}`);
  if (data) console.dir(data, { depth: null });
}

export async function GET(req: NextRequest, context: { params: Promise<{ reference: string }> }) {
  const params = await context.params;
  logStep("GET /api/pay", { reference: params.reference, headers: Object.fromEntries(req.headers.entries()) });

  return NextResponse.json({
    label: "My Store",
    icon: "https://solanapay.com/src/img/branding/Solanapay-logo-with-text.png",
  });
}

export async function POST(req: NextRequest, context: { params: Promise<{ reference: string }> }) {
  logStep("POST /api/pay/:reference — STARTED");

  try {
    const body = await req.json();
    const { reference } = await context.params;
    const [referenceKey, amountStr, percentageStr] = reference.split("-");

    logStep("Parsed Request", { referenceKey, amountStr, percentageStr, body });

    const account = body?.account;
    if (!account) {
      logStep("❌ Missing account in request body");
      return NextResponse.json({ error: "Account required in body" }, { status: 400 });
    }

    const amount = parseFloat(amountStr);
    const percentage = parseFloat(percentageStr);

    await addReferenceToAccount(referenceKey, account);
    await accountToAmount(account, amount);
    logStep("Stored reference and amount mapping in KV", { referenceKey, account, amount });

    const senderPubkey = new PublicKey(account);
    const recipientPubkey = new PublicKey(RECIPIENT);
    const feeCollectorPubkey = new PublicKey(FEE_COLLECTOR);
    const referencePubkey = new PublicKey(referenceKey);

    logStep("Public Keys Derived", {
      sender: senderPubkey.toBase58(),
      recipient: recipientPubkey.toBase58(),
      feeCollector: feeCollectorPubkey.toBase58(),
      reference: referencePubkey.toBase58(),
    });

    // 🔹 Fetch SOL Price
    const solPrice = await getSolPrice();
    logStep("Fetched SOL Price", { solPrice });

    // 🔹 USD → SOL conversion
    const amountUsd = Math.floor(amount * (1 - percentage / 100));
    const amountSol = amountUsd / solPrice;
    const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
    logStep("Calculated Amounts", { amountUsd, amountSol, lamports });

    // 🔹 Create transaction instruction
    const ix = await program.methods
      .transfer(new anchor.BN(lamports))
      .accounts({
        sender: senderPubkey,
        recipient: recipientPubkey,
        feeCollector: feeCollectorPubkey,
      })
      .instruction();

    ix.keys.push({
      pubkey: referencePubkey,
      isSigner: false,
      isWritable: false,
    });

    logStep("Instruction Created", { ix });

    const { blockhash } = await connection.getLatestBlockhash();
    logStep("Fetched Latest Blockhash", { blockhash });

    const message = new anchor.web3.TransactionMessage({
      payerKey: senderPubkey,
      recentBlockhash: blockhash,
      instructions: [ix],
    }).compileToV0Message();

    const transaction = new anchor.web3.VersionedTransaction(message);
    const base64 = Buffer.from(transaction.serialize()).toString("base64");

    logStep("Transaction Serialized", { base64 });

    // Trigger poll + mint logic
    logStep("⏳ Starting pollAndMint...");
    pollAndMint(referenceKey);

    logStep("✅ POST Complete — Returning response");

    return NextResponse.json({
      transaction: base64,
      message: `Transfer ${lamports} lamports (${amountSol.toFixed(5)} SOL)`,
    });
  } catch (error) {
    console.error("❌ Error in POST /api/pay:", error);
    return NextResponse.json(
      {
        error: "Failed to create transaction",
        details:
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : String(error),
      },
      { status: 500 }
    );
  }
}

const pollAndMint = async (reference: string, pollInterval = 2000, maxAttempts = 30) => {
  logStep("pollAndMint — STARTED", { reference });

  const account = await getKv(reference);
  const amount = await getKv(account!);

  logStep("Fetched from KV", { account, amount });

  const userPubKey = await getKv(reference);
  const asaPdaKey = await findUserAsaPda(new PublicKey(userPubKey!));
  const { spi_tokens, total_cashback, total_spent, total_transactions } =
    await readUserAsaPdaData(asaPdaKey);

  const new_spi_tokens = spi_tokens + parseInt(amount!) / 100;
  const new_total_spent = total_spent + parseInt(amount!);
  const new_total_cashback = total_cashback + parseInt(amount!) / 100;
  const new_total_transactions = total_transactions + 1;

  logStep("Prepared ASA Update Values", {
    new_spi_tokens,
    new_total_spent,
    new_total_cashback,
    new_total_transactions,
  });

  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const tx = await findReference(connection, new PublicKey(reference), {
        finality: "confirmed",
      });
      if (tx.signature) {
        logStep("🎯 Transaction confirmed on-chain", { signature: tx.signature });
        const tx2 = await mintSPI(parseInt(amount!) / 100, reference);
        logStep("✅ Tokens minted successfully", { tx2 });
        await updateAsa(new_spi_tokens, new_total_cashback, new_total_spent, new_total_transactions, userPubKey!, asaPdaKey);
        break;
      }
      logStep("trying again");
      return;
    } catch (err) {
      logStep(`⏳ Attempt ${attempts + 1} — Transaction not found yet`, { error: err });
    }

    await new Promise((res) => setTimeout(res, pollInterval));
    attempts++;
  }

  logStep("⚠️ pollAndMint — Finished without finding transaction", { attempts });
};
