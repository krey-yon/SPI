import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import { escapeXml, findUserAsaPda } from "@/utils/helper";
import { PublicKey } from "@solana/web3.js";
import { readUserAsaPdaData } from "@/utils/parsePda";

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  const userPubKey = new PublicKey(params.key);

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

  const key = params.key;
  const spiToken = spi_tokens;
  const CbEarned = total_cashback;
  const totalReward = 3;

  function truncateAddress(str: string) {
    if (str.length <= 23) {
      return str;
    }

    const start = str.slice(0, 7);
    const end = str.slice(-7);

    return `${start}.....${end}`;
  }

  const keyEsc = escapeXml(truncateAddress(key));
  const spiTokenEsc = escapeXml(String(spiToken));
  const cbEsc = escapeXml(CbEarned);
  const rewardEsc = escapeXml(String(totalReward));

  try {
    // Use absolute path for the image
    const imagePath = path.join(
      process.cwd(),
      "public",
      "assets",
      "Normies-NFT.png"
    );

    const template = sharp(imagePath).resize(500, 500);

    // Create text overlays using the variables
    const textSvg = `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <!-- optional: a soft glow filter -->
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <style><![CDATA[
        .title { font-family: "Orbitron", sans-serif; fill: #e6f9ff; font-size: 24px; font-weight:700; text-anchor:middle; }
        .label { font-family: "Rajdhani", sans-serif; fill:#b8c6c6; font-size:14px; text-anchor:middle; }
        .value { font-family: "Orbitron", sans-serif; fill:#00f7e6; font-size:18px; font-weight:600; text-anchor:middle; filter: url(#glow); }
        .badge { font-family: "Rajdhani", sans-serif; fill:#fff; font-size:16px; font-weight:700; text-anchor:middle; }
      ]]></style>

      <!-- Key rendered as a semi-stylized chip -->
      <text x="250" y="209"
            font-family="'Orbitron', sans-serif"
            fill="#212121"
            font-size="18px"
            font-weight="600"
            text-anchor="middle"
            filter="url(#glow)">
            ${keyEsc}
      </text>

      <!-- Tokens & rewards grouped with dividing line -->
      <line x1="60" y1="220" x2="440" y2="220" stroke="#18323a" stroke-width="1" opacity="0.25"/>

      <!-- Left info block -->
      <g transform="translate(0,0)">
        <text x="180" y="255" class="label">SPI Tokens</text>
        <text x="180" y="280" class="value">${spiTokenEsc}</text>
      </g>

      <!-- Right info block -->
      <g transform="translate(0,0)">
        <text x="315" y="255" class="label">Cashback Earned</text>
        <!-- show cashback and purchase as more visual pair -->
        <text x="315" y="280" class="value">${cbEsc}</text>
      </g>

      <!-- Reward badge at bottom center -->
      <g>
        <circle cx="250" cy="340" r="25" fill="none" stroke="#00f7e6" stroke-width="2" opacity="0.35"/>
        <text x="251" y="347" class="badge">${rewardEsc}</text>
        <text x="250" y="390" class="label">Total Reward</text>
      </g>

    </svg>
    `;

    const finalImage = await template
      .composite([{ input: Buffer.from(textSvg), top: 0, left: 0 }])
      .jpeg()
      .toBuffer();

    // Return image with proper Next.js response
    return new NextResponse(finalImage, {
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
