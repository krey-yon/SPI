import { PROGRAM_ID, RPC_URL } from "@/app/constant";
import * as anchor from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
} from "@solana/web3.js";
import { Spi } from "../../spi";
import idl from "../../idl.json";

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Missing PRIVATE_KEY in environment variables");
}

const connection = new Connection(RPC_URL, "confirmed");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const provider = new anchor.AnchorProvider(connection, {} as any , {});
const program = new anchor.Program(
  idl as anchor.Idl,
  provider
) as anchor.Program<Spi>;

export function escapeXml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const findUserAsaPda = async (userPubkey: PublicKey) => {
  const programIdPubkey = new PublicKey(PROGRAM_ID);
  const [userAsaPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user_asa_spi_trial_7"), userPubkey.toBuffer()],
    programIdPubkey
  );
  return userAsaPda;
};

export function unixToShortDate(unixTimestamp: number): string {
  if (!unixTimestamp || isNaN(unixTimestamp)) return "Invalid date";
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function getSolPrice(): Promise<number> {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
  );
  const data = await res.json();
  return data.solana.usd;
}

export async function updateAsa(
  new_spi_tokens: number,
  new_total_cashback: number,
  new_total_spent: number,
  new_total_transactions: number,
  userPubKey: string,
  asaPda: PublicKey
): Promise<string | void> {
  try {
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 400_000,
    });
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1,
    });

    // ✅ Decode private key safely
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey)
      throw new Error("Missing PRIVATE_KEY in environment variables");

    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));

    const authorityPubkey = new PublicKey(userPubKey);

    // ✅ Execute transaction
    const tx = await program.methods
      .updateUserAsaProgram(
        new anchor.BN(new_spi_tokens),
        new anchor.BN(new_total_cashback),
        new anchor.BN(new_total_spent),
        new anchor.BN(new_total_transactions),
        null
      )
      .accounts({
        authority: keypair.publicKey,
        customer: authorityPubkey,
        //@ts-expect-error expect error
        userAsa: asaPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([keypair])
      .preInstructions([modifyComputeUnits, addPriorityFee])
      .transaction();

    
    tx.feePayer = keypair.publicKey;
    tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    tx.sign(keypair);
    
    
    const txSig = await provider.connection.sendRawTransaction(
      tx.serialize(),
      { skipPreflight: false, preflightCommitment: "confirmed" }
    );
    console.log("✅ ASA updated successfully:", txSig);
    return txSig;
  } catch (err) {
    console.error("❌ Error in updating ASA:", err);
  }
}
