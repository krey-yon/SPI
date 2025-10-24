import { NextRequest, NextResponse } from "next/server";
import { RECIPIENT, FEE_COLLECTOR, AMOUNT_SOL, RPC_URL } from "@/app/constant";
import * as anchor from "@coral-xyz/anchor";
import idl from "../../../../../idl.json";
import { Spi } from "../../../../../spi";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { db } from "@/db";
import { getTransaction, updateTransaction } from "@/lib/db";
import { mintSPI } from "@/actions/reward";
import { findReference } from "@solana/pay";

// Create Solana connection
const connection = new Connection(RPC_URL, "confirmed");
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

// export async function POST(req: NextRequest, { params }: { params: { reference: string } }) {
//   console.log("==========================================");
//   console.log("POST /api/pay/:reference");

//   try {
//     const body = await req.json();
//     console.log("Body:", body);
//     console.log("Params:", params);

//     const account = body?.account;
//     if (!account) {
//       return NextResponse.json({ error: "Account required in body" }, { status: 400 });
//     }

//     const reference = await params?.reference;
//     if (!reference) {
//       return NextResponse.json({ error: "Reference required in URL" }, { status: 400 });
//     }

//     console.log("✅ Sender:", account);
//     console.log("✅ Reference:", reference);

//     const senderPubkey = new PublicKey(account);
//     const recipientPubkey = new PublicKey(RECIPIENT);
//     const feeCollectorPubkey = new PublicKey(FEE_COLLECTOR);
//     const programId = new PublicKey(PROGRAM_ID);
//     const referencePubkey = new PublicKey(reference);

//     const lamports = AMOUNT_SOL * LAMPORTS_PER_SOL;

//     console.log("✅ Transfer details:");
//     console.log("  - Amount:", lamports, "lamports");
//     console.log("  - Sender:", senderPubkey.toBase58());
//     console.log("  - Recipient:", recipientPubkey.toBase58());
//     console.log("  - Fee Collector:", feeCollectorPubkey.toBase58());

//     const discriminator = await getDiscriminator("transfer_with_fee");
//     const amountBytes = u64ToBytes(lamports);
//     const data = Buffer.concat([discriminator, amountBytes]);

//     console.log("✅ Instruction data:");
//     console.log("  - Discriminator:", discriminator.toString("hex"));
//     console.log("  - Amount bytes:", amountBytes.toString("hex"));

//     const instruction = new TransactionInstruction({
//       programId,
//       keys: [
//         { pubkey: senderPubkey, isSigner: true, isWritable: true },
//         { pubkey: recipientPubkey, isSigner: false, isWritable: true },
//         { pubkey: feeCollectorPubkey, isSigner: false, isWritable: true },
//         { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
//         { pubkey: referencePubkey, isSigner: false, isWritable: false },
//       ],
//       data,
//     });

//     console.log("✅ Instruction created with", instruction.keys.length, "accounts");

//     const { blockhash } = await connection.getLatestBlockhash();
//     console.log("✅ Blockhash:", blockhash);

//     const message = new TransactionMessage({
//       payerKey: senderPubkey,
//       recentBlockhash: blockhash,
//       instructions: [instruction],
//     }).compileToV0Message();

//     const transaction = new VersionedTransaction(message);
//     const serialized = transaction.serialize();
//     const base64 = Buffer.from(serialized).toString("base64");

//     console.log("✅ Transaction created, size:", base64.length, "bytes");
//     console.log("==========================================");

//     const fee = lamports * 0.01;
//     const recipientAmount = lamports * 0.99;

//     return NextResponse.json({
//       transaction: base64,
//       message: `Transfer ${AMOUNT_SOL} SOL (Fee: ${(fee / LAMPORTS_PER_SOL).toFixed(3)} SOL, Recipient: ${(recipientAmount / LAMPORTS_PER_SOL).toFixed(3)} SOL)`,
//     });
//   } catch (error) {
//     console.error("❌ Error:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to create transaction",
//         details: error instanceof Error ? error.message : String(error),
//       },
//       { status: 500 }
//     );
//   }
// }

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

    updateTransaction(reference, {
      userPubkey: account,
      amount: 100, // or any number you want
    });

    // const newTx = {
    //   reference,
    //   userPubkey: account,
    //   amount: 0,
    //   status: "pending" as const,
    // };

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
  const txRecord = getTransaction(reference);
  if (!txRecord) throw new Error("Transaction not found in DB");

  if (txRecord.status === "completed") {
    console.log("✅ Transaction already processed, skipping mint");
    return;
  }

  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const tx = await findReference(connection, new PublicKey(reference), {
        finality: "confirmed",
      });
      if (tx.signature) {
        console.log("🎯 Transaction confirmed on-chain");

        // Update DB status to prevent double minting
        updateTransaction(reference, { status: "completed" });

        // Call mintSPI once
        const tx2 = await mintSPI(txRecord.amount, reference);
        console.log(tx2);
        console.log("✅ Tokens minted successfully");
        break;
      }
      return;
    } catch (err) {
      console.log(`⏳ Transaction not found yet, attempt ${attempts + 1}`);
    }

    await new Promise((res) => setTimeout(res, pollInterval));
    attempts++;
  }
};
