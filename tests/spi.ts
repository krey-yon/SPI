import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Spi } from "../target/types/spi";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

describe("spi", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.spi as Program<Spi>;
  anchor.setProvider(anchor.AnchorProvider.env());

  // Helper function to get SOL balance
  async function getBalance(pubkey: anchor.web3.PublicKey): Promise<number> {
    const provider = anchor.AnchorProvider.env();
    return await provider.connection.getBalance(pubkey);
  }

  const RENT_EXEMPT_MINIMUM = 890880;

  // describe("spi_transfer", () => {
  //   anchor.setProvider(anchor.AnchorProvider.env());

  //   // const program = anchor.workspace.customSp as Program<Spi>;
  //   const program = anchor.workspace.spi as Program<Spi>;
  //   const provider = anchor.AnchorProvider.local();

  //   it("Transfer 10 SOL with 1% fee", async () => {
  //     // Create test accounts
  //     const sender = provider.wallet;
  //     const recipient = new PublicKey(
  //       "DWMUhPcij6YoUJop3pMQLgpqnTnwLd6LA4Ja1Tq8e6f2"
  //     );
  //     const feeCollector = new PublicKey(
  //       "C5MJDfqfyYTtVcfhHqyGa2J12tfs2isdwZBgxSY9qbJF"
  //     );

  //     // Amount to transfer: 10 SOL
  //     const transferAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);

  //     console.log("\n🔵 Initial Setup:");
  //     console.log("Sender:", sender.publicKey.toBase58());
  //     console.log(
  //       "Transfer Amount:",
  //       transferAmount.toNumber() / LAMPORTS_PER_SOL,
  //       "SOL"
  //     );
  //     // Execute transfer with fee
  //     const tx = await program.methods
  //       .transfer(transferAmount)
  //       .accounts({
  //         sender: sender.publicKey,
  //         recipient: recipient,
  //         feeCollector: feeCollector,
  //         // systemProgram: anchor.web3.SystemProgram.programId,
  //       })
  //       .rpc();

  //     const ata = new PublicKey("9tHMx5e9gJkYAfTKbrWTv6V1DR7xihRWjfHXiiLnS73");
  //     const mintAddres = new PublicKey("6q7ib5iHidx5peiyUc28r5mXDzTBQnc7mAyfQq76f3My")

  //     // const tx2 = await program.methods.mintToUser(new anchor.BN(100 * LAMPORTS_PER_SOL)).accounts({
  //     //   mint: mintAddres,
  //     //   owner: sender.publicKey,
  //     //   payer: sender.publicKey,
  //     //   recipient: recipient,

  //     // }).rpc();

  //     console.log("\n✅ Transaction signature:", tx);
  //     // console.log("token mint sig: ", tx2)
  //   });
  // });
  //
  it("mint token", async () => {
    const mintAddres = new PublicKey("6q7ib5iHidx5peiyUc28r5mXDzTBQnc7mAyfQq76f3My")
    const recipient = new PublicKey(
      "DWMUhPcij6YoUJop3pMQLgpqnTnwLd6LA4Ja1Tq8e6f2"
    );
    const sender = anchor.AnchorProvider.local();
    
    const tx = await program.methods.rewardPoints(new anchor.BN(100 * LAMPORTS_PER_SOL)).accounts({
      mint: mintAddres,
      owner: sender.publicKey,
      payer: sender.publicKey,
      recipient: recipient,
    }).rpc();
    console.log(tx)
  });
});
