import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Spi } from "../target/types/spi";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

const users = [
  "9yq4PYKfL2TANuTmkA7jzqgSh3vVt7Sy8rS7pKXJtWfM",
  "2P7Qv8jskj3xN8X7kaHfWmZkWbySo6bbn2eEz8MPL8ha",
  "FgH7wv8nLgEtnhKyXupZk8UmD9RmA1qjQSpJyeZnXq2P",
  "4o8LB3RBJqB9UddQ4G3wVSnT1sNMF2m5y8h1g8StxDKQ",
  "7Lsx3HDhGr6yZCBf7UXuV5Vj8QzKecbTBYF3pKf9hGqN",
  "8q1gHzbLBGZwqMepHjWg8PHTQTr4LqkKxAd9VrfCuXcz",
  "EPgAqJZQ6T84P2GAsKh4x7h7zoxsGTHV3doh8vF7b6yE",
  "9nXhBph2G1LR6qVZYm3Z1t7bKJkoUXYgzokhr4BdGEum",
  "6j1Xc3o3aMB5qT3bdy7Xog1oY2myG6ZsX2rA9wLEtW8G",
  "BbpF8vmQH5DJ6xYkZCEy2obSmxVRnq1yKAv9hRkhtnhU",
];

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

  // it("mint token", async () => {
  //   const mintAddres = new PublicKey("6q7ib5iHidx5peiyUc28r5mXDzTBQnc7mAyfQq76f3My")
  //   const recipient = new PublicKey(
  //     "DWMUhPcij6YoUJop3pMQLgpqnTnwLd6LA4Ja1Tq8e6f2"
  //   );
  //   const sender = anchor.AnchorProvider.local();

  //   const tx = await program.methods.rewardPoints(new anchor.BN(100 * LAMPORTS_PER_SOL)).accounts({
  //     mint: mintAddres,
  //     owner: sender.publicKey,
  //     payer: sender.publicKey,
  //     recipient: recipient,
  //   }).rpc();
  //   console.log(tx)
  // });

  //testing merkle generation

  // it("prime user merkle creation", async () => {
  //   const leaves = users.map((x) => keccak256(x));
  //   // Build the Merkle tree
  //   const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  //   const root = tree.getRoot();
  //   const merkleRootBytes = Array.from(root);

  //   const provider = anchor.AnchorProvider.local();
  //   // console.log(root)
  //   // console.log(Array.from(root))
  //   // console.log(typeof Array.from(root))
  //   const tx = await program.methods
  //     .createPrimeUserMerklePda(merkleRootBytes)
  //     .accounts({
  //       admin: provider.wallet.publicKey,
  //     })
  //     .rpc();
  //   console.log("Transaction signature:", tx);
  // });
  //

  // it("updateing merkle tree pda", async () => {
  //   const leaves = users.map((x) => keccak256(x));
  //   // Build the Merkle tree
  //   const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  //   console.log(tree.toString())
  //   const root = tree.getRoot();
  //   const newLeaf = keccak256("Ce4tFuiaaxrWWorNUfqUAH87LGnLVZKvxGz9emfudEbA");
  //   tree.addLeaf(newLeaf);
  //   console.log(tree.getRoot().toString())
  //   const merkleRootBytes = Array.from(root);
  //   const newLeafProof = tree.getProof(newLeaf);
  //   console.log(newLeafProof)
  //   console.log(typeof newLeafProof)
  //   const provider = anchor.AnchorProvider.local();
  //   // console.log(root)
  //   // console.log(Array.from(root))
  //   // console.log(typeof Array.from(root))
  //   const tx = await program.methods
  //     .updatePrimeUserMerklePda(merkleRootBytes)
  //     .accounts({
  //       admin: provider.wallet.publicKey,
  //     })
  //     .rpc();
  //   console.log("Transaction signature:", tx);
  // })

  it("creating user asa", async () => {
    const provider = anchor.AnchorProvider.local();

    const leaves = users.map((x) => keccak256(x));
    // Build the Merkle tree
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    console.log(tree.toString());
    const root = tree.getRoot();
    const newLeaf = keccak256("Ce4tFuiaaxrWWorNUfqUAH87LGnLVZKvxGz9emfudEbA");
    tree.addLeaf(newLeaf);
    console.log(tree.getRoot().toString());

    const proof = tree.getProof(newLeaf);
    const proofBytes = proof.map((x) => Array.from(x.data));
    const validTill = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
    // const tx = await program.methods
    //   .createUserAsaProgram("vikas", proofBytes, new anchor.BN(validTill))
    //   .accounts({
    //     authority: provider.wallet.publicKey,
    //   })
    //   .rpc();

    
    // ✅ Define the customer wallet
    const customerPubkey = new PublicKey("EGqp1Wx49TmTgE7XR5CARvzq3dxLVbRXji4KcD9REdtG");
    
    // ✅ Derive the PDA using the customer's public key (not the authority's)
    const [userAsaPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_asa_spi_trial_7"), customerPubkey.toBuffer()],
      program.programId
    );

    console.log("Customer:", customerPubkey.toBase58());
    console.log("Authority (payer):", provider.wallet.publicKey.toBase58());
    console.log("UserASA PDA:", userAsaPda.toBase58());

    const tx2 = await program.methods
      .createUserAsaProgram("vikas", proofBytes, new anchor.BN(validTill))
      .accounts({
        authority: provider.wallet.publicKey,  // ✅ Who signs and pays
        customer: customerPubkey,               // ✅ For whom the ASA is created
        userAsa: userAsaPda,                    // ✅ Explicitly provide the PDA
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ ASA created successfully, tx:", tx2);
  });
});
