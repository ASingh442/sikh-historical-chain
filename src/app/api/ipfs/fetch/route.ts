import { NextRequest, NextResponse } from "next/server";

/**
 * Secure server-side proxy to fetch IPFS files using Pinata Gateway
 * Automatically strips ipfs:// prefix and handles Cloudflare blocks
 */

export async function GET(req: NextRequest) {
  try {
    const hashParam = req.nextUrl.searchParams.get("hash");
    if (!hashParam) {
      return NextResponse.json({ error: "Missing CID" }, { status: 400 });
    }

    // Remove ipfs:// prefix or accidental URL parts
    const cleanCID = hashParam.replace(/^ipfs:\/\//, "").replace(/^\/+/, "");

    // Use a reliable gateway (Pinata → IPFS.io → Cloudflare)
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${cleanCID}`,
      `https://ipfs.io/ipfs/${cleanCID}`,
      `https://cloudflare-ipfs.com/ipfs/${cleanCID}`,
    ];

    let res: Response | null = null;
    let lastError: any = null;

    for (const url of gateways) {
      try {
        res = await fetch(url);
        if (res.ok) {
          const contentType = res.headers.get("content-type") || "application/octet-stream";
          const blob = await res.blob();
          return new Response(blob, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } else {
          lastError = await res.text();
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw new Error(lastError || "Failed to fetch from all gateways");
  } catch (err: any) {
    console.error("❌ IPFS fetch error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
