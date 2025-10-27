import { Connection, PublicKey } from "@solana/web3.js"

export const readUserAsaPdaData = async (pda: PublicKey) => {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
  const accountInfo = await connection.getAccountInfo(pda)

  if (!accountInfo) {
    throw new Error('❌ Account not found for PDA: ' + pda.toBase58())
  }

  const data = accountInfo.data
  
  console.log("Account data length:", data.length);
  console.log("Raw data (hex):", data.toString("hex"));
  
  let offset = 8 // Skip Anchor discriminator

  // === Decode name ===
  const nameLen = data.readUInt32LE(offset)
  offset += 4
  const name = data.slice(offset, offset + nameLen).toString('utf8')
  offset += nameLen

  const readU64 = () => {
    const val = Number(data.readBigUInt64LE(offset))
    offset += 8
    return val
  }

  const spi_tokens = readU64()
  const total_cashback = readU64()
  const valid_till_unix_timestamp = readU64()
  const join_date_unix_timestamp = readU64()
  const total_spent = readU64()
  const total_transactions = readU64()

  // === Decode Vec<[u8; 32]> ===
  const vecLen = data.readUInt32LE(offset)
  offset += 4

  const merkle_proof: string[] = []
  for (let i = 0; i < vecLen; i++) {
    const node = data.slice(offset, offset + 32)
    merkle_proof.push(Buffer.from(node).toString('hex'))
    offset += 32
  }

  return {
    name,
    spi_tokens,
    total_cashback,
    valid_till_unix_timestamp,
    join_date_unix_timestamp,
    total_spent,
    total_transactions,
    merkle_proof,
  }
}