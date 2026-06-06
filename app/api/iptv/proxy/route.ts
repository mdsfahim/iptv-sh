import { NextRequest, NextResponse } from "next/server";

function resolveUrl(relative: string, base: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing 'url' parameter" }, { status: 400 });
  }

  try {
    // 1. Fetch the target URL
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from target URL (Status ${response.status})` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    
    // Determine if it is an M3U8/M3U playlist
    const isM3U8 =
      contentType.toLowerCase().includes("mpegurl") ||
      contentType.toLowerCase().includes("mpeg-url") ||
      targetUrl.toLowerCase().split(/[?#]/)[0].endsWith(".m3u8") ||
      targetUrl.toLowerCase().split(/[?#]/)[0].endsWith(".m3u");

    if (isM3U8) {
      const text = await response.text();
      const lines = text.split(/\r?\n/);
      const proxyBaseUrl = `${origin}/api/iptv/proxy`;

      const rewrittenLines = lines.map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return line;

        if (trimmed.startsWith("#")) {
          // Rewrite any URI attributes within tags, e.g., URI="..." or URI='...' or URI=...
          return line.replace(
            /URI=(?:"([^"]+)"|'([^']+)'|([^,\s]+))/g,
            (match, qDouble, qSingle, unquoted) => {
              const uri = qDouble || qSingle || unquoted;
              if (!uri) return match;
              const resolved = resolveUrl(uri, targetUrl);
              return `URI="${proxyBaseUrl}?url=${encodeURIComponent(resolved)}"`;
            }
          );
        } else {
          // Rewrite the direct stream/segment URL line
          const resolved = resolveUrl(trimmed, targetUrl);
          return `${proxyBaseUrl}?url=${encodeURIComponent(resolved)}`;
        }
      });

      return new Response(rewrittenLines.join("\n"), {
        status: 200,
        headers: {
          "Content-Type": contentType || "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } else {
      // It's a segment (like .ts, .mp4, etc.) or key file. Stream the response directly.
      const headers: Record<string, string> = {
        "Content-Type": contentType || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      };

      const contentLength = response.headers.get("content-length");
      if (contentLength) {
        headers["Content-Length"] = contentLength;
      }
      
      const cacheControl = response.headers.get("cache-control");
      if (cacheControl) {
        headers["Cache-Control"] = cacheControl;
      } else {
        headers["Cache-Control"] = "public, max-age=3600";
      }

      return new Response(response.body, {
        status: response.status,
        headers,
      });
    }
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch from target URL" },
      { status: 500 }
    );
  }
}
