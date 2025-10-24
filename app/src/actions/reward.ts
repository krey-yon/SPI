"use server";
import { RPC_URL } from "@/app/constant";
import * as anchor from "@coral-xyz/anchor";
import idl from "../../idl.json";
import { Spi } from "../../spi";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { addTransaction, getTransaction, updateTransaction } from "@/lib/db";

// Create Solana connection
const connection = new Connection(RPC_URL, "confirmed");

// Load the keypair once at module level
const keypair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY!));

// Create a proper wallet wrapper for Anchor
const wallet = {
  publicKey: keypair.publicKey,
  signTransaction: async (tx: any) => {
    tx.partialSign(keypair);
    return tx;
  },
  signAllTransactions: async (txs: any[]) => {
    return txs.map((tx) => {
      tx.partialSign(keypair);
      return tx;
    });
  },
};

const provider = new anchor.AnchorProvider(connection, wallet as any, {
  commitment: "confirmed",
});

const program = new anchor.Program(
  idl as anchor.Idl,
  provider
) as anchor.Program<Spi>;

const mintAddres = new PublicKey(
  "6q7ib5iHidx5peiyUc28r5mXDzTBQnc7mAyfQq76f3My"
);

export const mintSPI = async (amount: number, reference: string) => {
  console.log("🔍 [mintSPI] Starting for reference:", reference);

  // Fetch transaction from DB
  const storedTx = getTransaction(reference);
  console.log("📂 [mintSPI] Retrieved stored transaction:", storedTx);

  if (!storedTx?.userPubkey) {
    console.error("❌ [mintSPI] No userPubkey found in stored transaction");
    throw new Error("No userPubkey found in stored transaction");
  }

  // Recipient and associated token account
  const recipient = new PublicKey(storedTx.userPubkey);
  const recipientPubkey = new PublicKey(storedTx.userPubkey);
  
  // Derive the correct ATA
  // const recipientATA = await getAssociatedTokenAddress(mintAddres, recipientPubkey);
  
  // console.log("🪙 [mintSPI] Recipient ATA:", recipientATA.toBase58());
  
  // Optional: verify balance
  // const accountInfo = await connection.getTokenAccountBalance(recipientATA);
  // console.log("Token balance:", accountInfo.value.uiAmountString);
  const mintAddres = new PublicKey("6q7ib5iHidx5peiyUc28r5mXDzTBQnc7mAyfQq76f3My")
  
  // Minting
  try {
    console.log(`💰 [mintSPI] Minting ${amount} tokens to recipient ATA...`);
    const tx = await program.methods
      .rewardPoints(new anchor.BN(amount * LAMPORTS_PER_SOL))
      .accounts({
        mint: mintAddres,
        owner: keypair.publicKey,
        payer: keypair.publicKey,
        recipient: recipientPubkey
      })
      .signers([keypair])
      .rpc();

    console.log("✅ [mintSPI] Mint transaction successful. Signature:", tx);

    // Update status in DB
    updateTransaction(reference, { status: "minted" });
    console.log("📂 [mintSPI] Updated transaction status to 'minted'");

    return tx;
  } catch (err) {
    console.error("❌ [mintSPI] Mint transaction failed:", err);
    updateTransaction(reference, { status: "failed" });
    throw err;
  }
};


export const createTxnFile = async (reference: string) => {
  addTransaction(reference);
  return { success: true };
};
