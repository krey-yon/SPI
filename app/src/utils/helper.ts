import * as anchor from "@coral-xyz/anchor"
import { PublicKey } from "@solana/web3.js";

export function escapeXml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const findUserAsaPda = async (userPubkey: PublicKey) => {
  const programIdPubkey = new PublicKey(userPubkey);
  const [userAsaPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user_asa_spi_trial_7"), userPubkey.toBuffer()],
    programIdPubkey
  );
  return userAsaPda;
};
