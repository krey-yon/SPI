"use server";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
  generateSigner,
  publicKey
} from "@metaplex-foundation/umi";
import { create, mplCore } from "@metaplex-foundation/mpl-core";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import bs58 from "bs58";

export async function createNft(userKey: string) {
  const umi = createUmi("https://api.devnet.solana.com")
    .use(mplCore())
    .use(
      irysUploader({
        // mainnet address: "https://node1.irys.xyz"
        // devnet address: "https://devnet.irys.xyz"
        address: "https://devnet.irys.xyz",
      })
    );

  let keypairBytes: Uint8Array;

  const envKey = process.env.PRIVATE_KEY?.trim();
  if (!envKey) throw new Error("Missing SOLANA_PRIVATE_KEY_HEX in .env");

  if (envKey.startsWith("[")) {
    keypairBytes = new Uint8Array(JSON.parse(envKey));
  } else if (/^[0-9a-fA-F]+$/.test(envKey)) {
    keypairBytes = Uint8Array.from(Buffer.from(envKey, "hex"));
  } else {
    keypairBytes = bs58.decode(envKey);
  }

  const keypair = umi.eddsa.createKeypairFromSecretKey(keypairBytes);
  const signer = createSignerFromKeypair(umi, keypair);
  umi.use(signerIdentity(signer));

  const imageLink = `https://spi.kreyon.in/dynamic/${userKey}`;

  const metadata = {
    name: "SPI Prime Member",
    symbol: "$SPI",
    description:
      "This NFT represents a verified SPI Pay Prime Membership on Solana.",
    image: imageLink,
    external_url: `https://spi.kreyon.in/dynamic/${userKey}`,
    attributes: [
      { trait_type: "Membership Level", value: "Prime" },
      { trait_type: "Network", value: "Solana" },
      { trait_type: "Issued To", value: userKey },
      { trait_type: "Creator", value: "vikas@spi.kreyon.in" },
    ],
    properties: {
      files: [
        {
          uri: imageLink,
          type: "image/png",
        },
      ],
      category: "image",
    },
  };

  const metadataUri = await umi.uploader.uploadJson(metadata);

  const asset = generateSigner(umi);
  const ownernft = publicKey(userKey);
  const tx = await create(umi, {
    asset,
    name: "My NFT",
    uri: metadataUri,
    owner: ownernft,
  }).sendAndConfirm(umi);

  console.log("✅ NFT Created and Transferred!");
  const signatureBase58 = bs58.encode(tx.signature);

  console.log(
    `🔗 Tx: https://explorer.solana.com/tx/${signatureBase58}?cluster=devnet`
  );
  console.log(`👑 Owner: ${userKey}`);

  return {
    signature: tx.signature,
    explorerUrl: `https://explorer.solana.com/tx/${signatureBase58}?cluster=devnet`,
    mintAddress: asset.publicKey.toString(),
  };
}
