import { NextRequest, NextResponse } from "next/server";
import { RECIPIENT, FEE_COLLECTOR, AMOUNT_SOL, RPC_URL } from "@/app/constant";
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
import { findUserAsaPda } from "@/utils/helper";
import { readUserAsaPdaData } from "@/utils/parsePda";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

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
  { params }: { params: { reference: string } }
) {
  console.log("==========================================");
  console.log("POST /api/pay/:reference");

  try {
    const body = await req.json();

    const { reference } = params;
    const [referenceKey, amountStr, percentageStr] = reference.split("-");

    // console.log("Body:", body);
    console.log("Reference:", referenceKey);

    const account = body?.account;
    if (!account) {
      return NextResponse.json(
        { error: "Account required in body" },
        { status: 400 }
      );
    }

    // updateTransaction(reference, {
    //   userPubkey: account,
    //   amount: 100, // or any number you want
    // });
    const amount = parseInt(amountStr);
    const percentage = parseInt(percentageStr);

    await addReferenceToAccount(reference, account);
    await accountToAmount(account, amount);

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

    const Amount_Sol = Math.floor(amount * (1 - percentage / 100));
    const lamports = Amount_Sol * LAMPORTS_PER_SOL;

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
      .instruction();

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

    pollAndMint(reference);
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

const pollAndMint = async (
  reference: string,
  pollInterval = 2000,
  maxAttempts = 30
) => {
  const account = await getKv(reference);
  const amount = await getKv(account!);

  const userPubKey = await getKv(reference);
  const asaPdaKey = await findUserAsaPda(new PublicKey(userPubKey!));
  const { spi_tokens, total_cashback, total_spent, total_transactions } =
    await readUserAsaPdaData(asaPdaKey);

  const new_spi_tokens = spi_tokens + parseInt(amount!) / 100;
  const new_total_spent = total_spent + parseInt(amount!);
  const new_total_cashback = total_cashback + parseInt(amount!) / 100;
  const new_total_transactions = total_transactions + 1;

  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const tx = await findReference(connection, new PublicKey(reference), {
        finality: "confirmed",
      });
      if (tx.signature) {
        console.log("🎯 Transaction confirmed on-chain");

        if (!amount) return;
        const tx2 = await mintSPI(parseInt(amount) / 100, reference);
        console.log(tx2);
        console.log("✅ Tokens minted successfully");
        break;
      }

      const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
        units: 400_000,
      });

      const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1,
      });

      const keypair = Keypair.fromSecretKey(
        bs58.decode(process.env.PRIVATE_KEY!)
      );

      const tx2 = await program.methods
        .updateUserAsaProgram(
          new anchor.BN(new_spi_tokens),
          new anchor.BN(new_total_cashback),
          new anchor.BN(new_total_spent),
          new anchor.BN(new_total_transactions),
          null
        )
        .accounts({
          authority: new PublicKey(userPubKey!),
          customer: new PublicKey(userPubKey!),
          userAsa: asaPdaKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([keypair])
        .preInstructions([modifyComputeUnits, addPriorityFee])
        .rpc();
      console.info("Transaction completed successfully and updated asa", tx2);

      return;
    } catch (err: unknown) {
      console.error(err);
      console.log(`⏳ Transaction not found yet, attempt ${attempts + 1}`);
    }

    await new Promise((res) => setTimeout(res, pollInterval));
    attempts++;
  }
};
