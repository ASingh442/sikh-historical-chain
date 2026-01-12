"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FileType,
  Shield,
  Calendar,
  Clock,
  User,
  Hash,
} from "lucide-react";

interface HashPreviewModalProps {
  hash: string | string[];
  entry: {
    title: string;
    description: string;
    verified: boolean;
    contributor: string;
    contributorShort: string;
    source: string;
    dateOfEvent: string;
    timestamp: string;
    fileName?: string;
    transactionHash?: string;
  };

  onClose: () => void;
}

export function HashPreviewModal({
  hash,
  entry,
  onClose,
}: HashPreviewModalProps) {
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // IPFS Parsing & Normalization
  // -----------------------------
  const parseIPFSHash = (
    raw: string
  ): { cid: string; path: string } | null => {
    if (!raw) return null;

    let h = String(raw).trim();

    // From full HTTPS URL
    if (h.startsWith("http://") || h.startsWith("https://")) {
      const url = new URL(h);
      const index = url.pathname.indexOf("/ipfs/");
      h =
        index !== -1
          ? url.pathname.slice(index + 6)
          : url.pathname.replace(/^\/+/, "");
    }

    // From ipfs://
    if (h.startsWith("ipfs://")) h = h.slice(7);

    // Clean slashes
    h = h.replace(/^\/+|\/+$/g, "").trim();
    if (!h) return null;

    const [cidCandidate, ...pathParts] = h.split("/");
    const cid = cidCandidate.trim();

    if (!/^[A-Za-z0-9]+$/.test(cid) || cid.length < 30) return null;

    return { cid, path: pathParts.join("/") };
  };

  const buildGatewayUrls = (raw: string): string[] => {
    const parsed = parseIPFSHash(raw);
    if (!parsed) return [];

    const { cid, path } = parsed;
    const suffix = path ? `/${path}` : "";

    const pinata =
      process.env.NEXT_PUBLIC_PINATA_GATEWAY ||
      "https://gateway.pinata.cloud/ipfs";
    const ipfsIo =
      process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs";
    const cloudflare = "https://cloudflare-ipfs.com/ipfs";

    return [
      `${pinata}/${cid}${suffix}`,
      `${ipfsIo}/${cid}${suffix}`,
      `${cloudflare}/${cid}${suffix}`,
    ];
  };

  const fetchIPFSFiles = async (hashes: string[]) => {
    setLoading(true);
    const urls: string[] = [];

    for (const raw of hashes) {
      const gateways = buildGatewayUrls(raw);
      if (gateways.length > 0) urls.push(gateways[0]);
    }

    setFileUrls(urls);
    setLoading(false);
  };

  useEffect(() => {
    const cleanHashes = Array.isArray(hash)
      ? hash
          .flatMap((h) =>
            (h || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          )
      : (hash || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    if (cleanHashes.length > 0) fetchIPFSFiles(cleanHashes);
    else setFileUrls([]);
  }, [hash]);

  // -----------------------------
  // COMPUTED TYPE LOGIC
  // -----------------------------
  const computedType =
    fileUrls.length === 0
      ? "METADATA"
      : fileUrls.length === 1
      ? "FILE"
      : "COLLECTION";

  // -----------------------------
  // Styles
  // -----------------------------
  const goldButton =
    "inline-block px-4 py-2 text-[var(--ivory-white)] font-semibold rounded-lg " +
    "bg-[var(--golden-saffron)] border border-[var(--golden-saffron)] shadow-sm " +
    "transition-all duration-300 hover:shadow-[0_0_15px_rgba(227,160,8,0.6)]";

  // -----------------------------
  // Renderers
  // -----------------------------
  const renderFiles = () => {
    if (loading)
      return (
        <p className="text-sm text-muted-foreground">Loading files...</p>
      );

    if (fileUrls.length === 0)
      return (
        <p className="text-sm text-muted-foreground">
          No files were uploaded for this entry.
        </p>
      );

    return fileUrls.map((url, i) => (
      <div key={i} className="flex items-center gap-6 mb-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={goldButton}
        >
          {entry.fileName || `Open File ${i + 1}`}
        </a>
      </div>
    ));
  };

  const renderHashes = () => {
    const list = Array.isArray(hash) ? hash : [hash];
    const hashes = list.flatMap((h) =>
      (h || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );

    return (
      <div className="flex flex-col gap-2">
        {(hashes.length
          ? hashes
          : ["No hash available as no files were uploaded"]
        ).map((h, i) => (
          <code
            key={i}
            className="block text-xs bg-secondary/50 px-4 py-3 rounded font-mono text-[var(--golden-saffron)] break-all border border-border/40"
          >
            {h}
          </code>
        ))}
      </div>
    );
  };

  // -----------------------------
  // JSX
  // -----------------------------
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass-effect border-border/50">
        <DialogHeader>
          <div className="flex flex-col gap-3">
            <DialogTitle className="font-serif text-2xl text-foreground mb-2">
              {entry.title}
            </DialogTitle>

            <DialogDescription className="text-base text-muted-foreground leading-relaxed">
              {entry.description}
            </DialogDescription>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Contributor:</span>
                <span className="text-foreground font-medium">
                  {entry.contributorShort}
                </span>
              </div>

              {entry.verified && (
                <Badge className="bg-primary/20 text-primary border-primary/50 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Content Hash</span>
            </div>
            {renderHashes()}
          </div>

          <div className="grid md:grid-cols-2 gap-4 p-4 bg-secondary/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Event Date:</span>
              <span className="text-foreground font-medium">
                {entry.dateOfEvent}
              </span>
            </div>

            {entry.transactionHash && (
              <div className="mt-6 p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                  <Hash className="h-4 w-4" />
                  <span>Blockchain Transaction</span>
                </div>

                <code className="block text-xs bg-secondary/40 px-4 py-3 rounded font-mono text-[var(--golden-saffron)] break-all border border-border/40">
                  {entry.transactionHash}
                </code>

                <a
                  href={`https://sepolia.etherscan.io/tx/${entry.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary underline"
                >
                  View on Sepolia Etherscan →
                </a>
              </div>
            )}


            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Added:</span>
              <span className="text-foreground font-medium">
                {new Date(entry.timestamp).toLocaleDateString("en-GB")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <FileType className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Type:</span>
              <span className="text-foreground font-medium uppercase">
                {computedType}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Contributor:</span>
              <span className="text-foreground font-medium">
                {entry.source || "Anonymous"}
              </span>
            </div>
          </div>
          <div className="relative w-full flex flex-col">
            <div className="flex-1 space-y-2 relative z-10">
              <h4 className="font-medium text-foreground">
                Content Preview
              </h4>
              {renderFiles()}
            </div>

            <div
              className="absolute pointer-events-none select-none z-0 text-primary font-black"
              style={{
                fontSize: `${Math.min(
                  4 + fileUrls.length * 1.5,
                  8
                )}rem`,
                opacity: "0.05",
                bottom: "-2rem",
                right: "5rem",
              }}
            >
              ੴ
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
