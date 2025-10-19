import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Spi } from "../target/types/spi";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";

describe("spi", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.spi as Program<Spi>;

  it("Create prime users merkle tree and store it in pda", async () => {
    const users = [
      "4RkyG245JtLz8H7dZ1Lw9o1Qj3Z4s2S6s9g3h5k2N",
      "9eX2W1p3jG6Tf2k8R4N7x9C1b5B3y4Z6h7k8M2J5",
      "2H2M1J3c6k9p8F5h2B1d4X7s6N9g2R5c1t8v7W6y",
      "5U8N1Y4x9v7b6Z5e2K1q3F8p4M2R7j9d6C1h3G5t",
      "7J2f8g4h6k9p1Q5w7x9y2T4c6V8b1N3m5R7t2H4q",
    ];
    const leaves = users.map((x) => keccak256(x));
    // Build the Merkle tree
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const root = tree.getRoot();
    const merkleRootBytes = Array.from(root);

    const provider = anchor.AnchorProvider.local();
    const tx = await program.methods
      .createPrimeUserMerklePda(merkleRootBytes)
      .accounts({
        admin: provider.wallet.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("updating the merkle tree", async () => {
    const users = [
      "4RkyG245JtLz8H7dZ1Lw9o1Qj3Z4s2S6s9g3h5k2N",
      "9eX2W1p3jG6Tf2k8R4N7x9C1b5B3y4Z6h7k8M2J5",
      "2H2M1J3c6k9p8F5h2B1d4X7s6N9g2R5c1t8v7W6y",
      "5U8N1Y4x9v7b6Z5e2K1q3F8p4M2R7j9d6C1h3G5t",
      "7J2f8g4h6k9p1Q5w7x9y2T4c6V8b1N3m5R7t2H4q",
    ];
    const leaves = users.map((x) => keccak256(x));
    // Build the Merkle tree
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const newLeaf = keccak256("DWMUhPcij6YoUJop3pMQLgpqnTnwLd6LA4Ja1Tq8e6f2");
    tree.addLeaf(newLeaf);
    const root = tree.getRoot();
    const merkleRootBytes = Array.from(root);

    const provider = anchor.AnchorProvider.local();
    const tx = await program.methods
      .updatePrimeUserMerklePda(merkleRootBytes)
      .accounts({
        admin: provider.wallet.publicKey,
      })
      .rpc();
    console.log("your transaction sig is: ", tx);
  });
});
