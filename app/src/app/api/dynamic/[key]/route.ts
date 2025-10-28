import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import { escapeXml, findUserAsaPda, unixToShortDate } from "@/utils/helper";
import { PublicKey } from "@solana/web3.js";
import { readUserAsaPdaData } from "@/utils/parsePda";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  try {
    const {key} = await context.params;
    const userPubKey = new PublicKey(key);

    // Get PDA and data
    const asaPdaKey = await findUserAsaPda(userPubKey);
    const {
      name,
      spi_tokens,
      total_cashback,
      valid_till_unix_timestamp,
      join_date_unix_timestamp,
      total_spent,
      total_transactions,
    } = await readUserAsaPdaData(asaPdaKey);

    // Escape values for XML safety
    const nameEsc = escapeXml(name || "");
    const spi_tokensEsc = escapeXml(String(spi_tokens || 0));
    const total_cashbackEsc = escapeXml(String(total_cashback || 0));
    const valid_till_unix_timestampEsc = escapeXml(String(unixToShortDate(valid_till_unix_timestamp) || 0));
    const join_date_unix_timestampEsc = escapeXml(String(unixToShortDate(join_date_unix_timestamp) || 0));
    const total_spentEsc = escapeXml(String(total_spent || 0));
    const total_transactionsEsc = escapeXml(String(total_transactions || 0));

    // Use absolute path for the NFT template
    const imagePath = path.join(process.cwd(), "public", "assets", "Prime Membership Card Design.png");
    const template = sharp(imagePath).resize(500, 500);

    // SVG overlay for dynamic fields
    const textSvg = `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <style><![CDATA[
        .title { font-family: "Orbitron", sans-serif; fill: #00f7e6; font-size: 26px; font-weight:700; text-anchor:middle; filter: url(#glow); }
        .label { font-family: "Rajdhani", sans-serif; fill:#b8c6c6; font-size:14px; text-anchor:middle; }
        .value { font-family: "Orbitron", sans-serif; fill:#00f7e6; font-size:18px; font-weight:600; text-anchor:middle; filter: url(#glow); }
      ]]></style>

      <!-- User Name -->
      <text x="250" y="215" class="title">${nameEsc}</text>

      <!-- SPI Tokens (Left) -->
      <text x="160" y="300" class="value">${spi_tokensEsc}</text>

      <!-- Total Cashback (Right) -->
      <text x="340" y="300" class="value">${total_cashbackEsc}</text>

      <!-- Valid Till -->
      <text x="130" y="380" class="value">${valid_till_unix_timestampEsc}</text>

      <!-- Join Date -->
      <text x="250" y="380" class="value">${join_date_unix_timestampEsc}</text>

      <!-- Total Spent -->
      <text x="370" y="380" class="value">${total_spentEsc}</text>

      <!-- Total Transactions (Bottom badge) -->
      <text x="250" y="460" class="value">${total_transactionsEsc}</text>
    </svg>`;

    // Composite SVG text onto NFT background
    const finalImage = await template
      .composite([{ input: Buffer.from(textSvg), top: 0, left: 0 }])
      .jpeg()
      .toBuffer();
    
    return new NextResponse(new Uint8Array(finalImage), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });

  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
