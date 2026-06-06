import { NextResponse } from "next/server";
import { getChannelsWithHash } from "../route";

export async function GET() {
  const { hash } = getChannelsWithHash();

  return NextResponse.json(
    { hash },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
}
