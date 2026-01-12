"use server";

import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    if (process.env.NEXT_PUBLIC_SHC_READ_ONLY === "true") {
      return NextResponse.json(
        { error: "SHC is in read-only mode" },
        { status: 503 }
      );
    }
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      return NextResponse.json(
        { error: "Missing PINATA_JWT in server env" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ error: "Max 5 files per block" }, { status: 400 });
    }

    const batchHashes = new Set<string>();

    // Map each file to a Promise
    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const hash = crypto.createHash("sha256").update(buffer).digest("hex");

      if (batchHashes.has(hash)) return null; // skip duplicates
      batchHashes.add(hash);

      const pinataData = new FormData();
      pinataData.append("file", file, (file as any).name || "upload");

      const pinataResponse = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${jwt}` },
          body: pinataData,
        }
      );

      const data = await pinataResponse.json();
      if (!pinataResponse.ok) {
        console.error("❌ Pinata Upload Error:", data);
        throw new Error("Pinata upload failed");
      }

      return {
        cid: data.IpfsHash,
        name: (file as any).name || "upload",
        size: buffer.length,
        type: file.type,
      };
    });

    // Run all uploads in parallel
    const uploads = (await Promise.all(uploadPromises)).filter(Boolean);

    return NextResponse.json({ uploads });
  } catch (error: any) {
    console.error("Server Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
