import { NextResponse } from "next/server";

/**
 * A simple proxy route to bypass CORS and forward RPC requests to Sepolia
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (
      process.env.NEXT_PUBLIC_SHC_READ_ONLY === "true" &&
      body?.method &&
      !body.method.startsWith("eth_call")
    ) {
      return NextResponse.json(
        { error: "Write operations disabled (read-only mode)" },
        { status: 503 }
      );
    }

    // ✅ Always ensure valid RPC endpoint
    const rpcUrl = "https://rpc2.sepolia.org";

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    // ❌ Some providers return HTML error pages — detect and handle that
    const text = await response.text();
    if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
      console.error("⚠️ RPC responded with HTML instead of JSON.");
      return NextResponse.json(
        { error: "Invalid response from RPC endpoint" },
        { status: 502 }
      );
    }

    // ✅ Try parsing as JSON safely
    const data = JSON.parse(text);
    return NextResponse.json(data);

  } catch (err: unknown) {
    // 🧩 Type narrowing for safety
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("❌ rpc-proxy error:", message);

    return NextResponse.json(
      { error: "Internal Server Error", details: message },
      { status: 500 }
    );
  }
}
