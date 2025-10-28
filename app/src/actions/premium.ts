import { RPC_URL } from "@/app/constant";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import idl from "../../idl.json";
import { Spi } from "../../spi";
import { updateUser } from "@/lib/getMerkleProof";

const connection = new Connection(RPC_URL, "confirmed");

// Load the keypair once at module level
const keypair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY!));

// Create a proper wallet wrapper for Anchor
const wallet = {
  publicKey: keypair.publicKey,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signTransaction: async (tx: any) => {
    tx.partialSign(keypair);
    return tx;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signAllTransactions: async (txs: any[]) => {
    return txs.map((tx) => {
      tx.partialSign(keypair);
      return tx;
    });
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const provider = new anchor.AnchorProvider(connection, wallet as any, {
  commitment: "confirmed",
});

const program = new anchor.Program(
  idl as anchor.Idl,
  provider
) as anchor.Program<Spi>;

export const handleBuyPrime = async (account: string) => {
  const { proofBytes } = updateUser(account);
  const validTill = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  const customerPubkey = new PublicKey(account);
  const [userAsaPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user_asa_spi_trial_7"), customerPubkey.toBuffer()],
    program.programId
  );
  const tx = await program.methods
    .createUserAsaProgram("vikas", proofBytes, new anchor.BN(validTill))
    .accounts({
      authority: provider.wallet.publicKey, // ✅ Who signs and pays
      customer: customerPubkey, // ✅ For whom the ASA is created
      //@ts-expect-error someerror
      userAsa: userAsaPda, // ✅ Explicitly provide the PDA
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([keypair])
    .rpc();
  console.log("asa generation successful and here is transaction sig", tx);
};
