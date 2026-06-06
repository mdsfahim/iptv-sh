import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// In-memory cache
let cachedChannels: Array<{
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
}> = [];
let cachedHash = "";
let lastLoadedTime = 0;

export function getChannelsWithHash() {
  const now = Date.now();

  // Refresh cache every 60 seconds
  if (now - lastLoadedTime > 60_000 || cachedChannels.length === 0) {
    try {
      const channelsPath = path.join(
        process.cwd(),
        "app/data/channels.json"
      );

      if (fs.existsSync(channelsPath)) {
        const fileContent = fs.readFileSync(channelsPath, "utf8");

        // Compute SHA-256 hash of raw file content
        cachedHash = crypto
          .createHash("sha256")
          .update(fileContent)
          .digest("hex");

        const raw = JSON.parse(fileContent);

        // Add IDs if not present and deduplicate
        cachedChannels = raw.map(
          (
            ch: { name: string; logo: string; group: string; url: string },
            idx: number
          ) => ({
            id: `ch-${idx}`,
            name: ch.name,
            logo: ch.logo || "",
            group: ch.group || "Uncategorized",
            url: ch.url,
          })
        );
        lastLoadedTime = now;
      }
    } catch (error) {
      console.error("Error reading IPTV channels file:", error);
    }
  }

  return { channels: cachedChannels, hash: cachedHash };
}

export async function GET() {
  const { channels, hash } = getChannelsWithHash();

  return NextResponse.json(channels, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      "X-Channels-Hash": hash,
    },
  });
}
