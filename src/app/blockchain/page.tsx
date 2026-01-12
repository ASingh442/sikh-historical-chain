"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Shield,
  Calendar,
  Clock,
  User,
  Hash,
  FileType,
} from "lucide-react";

import { HashPreviewModal } from "@/components/hash-preview-modal";
import { SubmitEntryModal } from "@/components/submit-entry-modal";

import { getContract } from "@/lib/connectContract";
import { SHC_READ_ONLY } from "@/lib/shcSafety";

type Entry = {
  id: number;
  title: string;
  description: string;
  contributor: string;
  contributorShort?: string;
  source: string;
  verified: boolean;
  dateOfEvent: string;
  timestamp: string;
  contentType: "METADATA" | "FILE" | "COLLECTION";
  approver?: string;
  fileNames?: string[];
  hash?: string;
  transactionHash?: string; // 👈 this is new
};

export default function BlockchainPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterVerified, setFilterVerified] = useState(false);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [targetHashToScroll, setTargetHashToScroll] = useState<string | null>(null);

  const entriesPerPage = 20;

// --------------------
  // ATTACH TRANSACTION HASH TO NEWEST ENTRY
  // --------------------
  useEffect(() => {
    const handler = (e: any) => {
      if (!e?.detail?.transactionHash) return;

      setEntries((prev) => {
        const now = Date.now();

        return prev.map((entry) => {
          const entryTime = new Date(entry.timestamp).getTime();
          const withinWindow = Math.abs(now - entryTime) < 60_000;

          return withinWindow && !entry.transactionHash
            ? { ...entry, transactionHash: e.detail.transactionHash }
            : entry;
        });
      });
    };

    window.addEventListener("entrySubmitted", handler);
    return () => window.removeEventListener("entrySubmitted", handler);
  }, []);

  // --------------------
  // LOAD BLOCKCHAIN ENTRIES
  // --------------------
  useEffect(() => {
    async function loadEntries() {
      setLoading(true); // ✅ reset loading on reload
      try {
        setError(null);

        const contract = await getContract(false); // read-only mode
        const total = await contract.totalRecords();
        const totalNum = Number(total);
        const fetched: any[] = [];

        for (let i = 1; i <= totalNum; i++) {
          const record = await contract.getRecord(i);
          const [
            id,
            title,
            rawDescription,
            source,
            ipfsHash,
            contributor,
            timestamp,
            status,
            approver,
          ] = record;

          let parsedDescription = rawDescription;
          let dateOfEvent = "N/A";
          let fileNames: string[] = [];


          try {
            const json = JSON.parse(rawDescription);
            if (json && typeof json === "object") {
              parsedDescription = json.description || "";
              dateOfEvent = json.dateOfEvent || "N/A";
            }
          } catch {
            parsedDescription = rawDescription;
          }

          const hashes = ipfsHash
            ? ipfsHash.split(",").map((h: string) => h.trim()).filter(Boolean)
            : [];

          let computedType: "METADATA" | "FILE" | "COLLECTION" = "METADATA";

          if (hashes.length === 1) computedType = "FILE";
          if (hashes.length > 1) computedType = "COLLECTION";


          fetched.push({
            id: Number(id),
            title,
            description: parsedDescription,
            fileNames,

            hash: ipfsHash,

            // wallet (on-chain truth)
            contributor,

            contributorShort:
              contributor && contributor !== "0x0000000000000000000000000000000000000000"
                ? contributor.slice(0, 6) + "..." + contributor.slice(-4)
                : "N/A",

            // human attribution (off-chain, optional)
            source: source || "Anonymous",

            verified: Number(status) === 1,
            dateOfEvent,
            timestamp: new Date(Number(timestamp) * 1000).toISOString(),
            contentType: computedType,
            approver,
          });
        }

        setEntries(fetched.reverse());

        // 🔐 Attach last transaction hash (if exists)
        const stored = JSON.parse(localStorage.getItem("txHashes") || "{}");

        if (stored.latest) {
          setEntries((prev) => {
            if (!prev.length) return prev;

            const updated = [...prev];
            if (stored.latest && prev.length) {
              const newest = prev[0]; // newest record after reverse()
              return [
                { ...newest, transactionHash: stored.latest },
                ...prev.slice(1),
              ];
            }
            return updated;
          });

          // Optional: clear once used
          delete stored.latest;
          localStorage.setItem("txHashes", JSON.stringify(stored));
        }


        // --------------------
        // AUTO-NAVIGATE FROM LEDGER (HASH)
        // --------------------
        const targetHash = searchParams?.get("hash");
        if (targetHash) {
          const index = fetched.findIndex((e) => e.hash === targetHash);
          if (index !== -1) {
            const page = Math.floor(index / entriesPerPage) + 1;
            setCurrentPage(page);
            setTargetHashToScroll(targetHash); // store for scrolling later
          }
        }
      } catch (err) {
        console.error("Error loading entries:", err);
        setError("Unable to load blockchain entries. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadEntries();
  }, [reloadKey, searchParams]);

  // --------------------
  // SCROLL TO TARGET HASH AFTER RENDER
  // --------------------
  useEffect(() => {
    if (!targetHashToScroll) return;

    const entry = entries.find((e) => e.hash === targetHashToScroll);
    if (entry) {
      setHighlightedId(entry.id);
      const el = document.getElementById(`entry-${entry.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTargetHashToScroll(null);
      }
    }
  }, [entries, targetHashToScroll]);

  // --------------------
  // FILTER + PAGINATE
  // --------------------
  const q = searchQuery.toLowerCase();
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.source.toLowerCase().includes(q) ||          // 👈 HUMAN NAME
      entry.contributor.toLowerCase().includes(q) ||     // 👈 FULL WALLET
      (entry.contributorShort?.toLowerCase().includes(q) ?? false);

    const matchesVerified = !filterVerified || entry.verified;
    return matchesSearch && matchesVerified;
  });

  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + entriesPerPage);

  // --------------------
  // RANGE FOR THREE-BUTTON NAV
  // --------------------
  const totalEntries = filteredEntries.length;
  const rangeStart = totalEntries === 0 ? 0 : startIndex + 1;
  const rangeEnd = Math.min(startIndex + entriesPerPage, totalEntries);

  // --------------------
  // UI HANDLERS
  // --------------------
  const handleHashClick = (entry: Entry) => {
    const stored = JSON.parse(localStorage.getItem("txHashes") || "{}");

    setSelectedEntry({
      ...entry,
      transactionHash:
        entry.transactionHash || stored.latest || undefined,
    });

    setSelectedHash(entry.hash || "");
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --------------------
  // UI BELOW
  // --------------------
  return (
    <div className="container mx-auto px-4 py-12">

    {process.env.NEXT_PUBLIC_SHC_READ_ONLY === "true" && (
      <div className="mb-6 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4 text-center text-sm text-black">
        SHC is temporarily in read-only mode due to maintenance or network protection.
        All historical records remain accessible.
      </div>
    )}

      {/* ---- HEADER ---- */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
            Sikh Historical Blockchain
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A decentralised, immutable archive of Sikh history, verified by the Sadh Sangat.
          </p>
        </div>

        {/* ---- SEARCH + FILTERS ---- */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, or contributor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-effect border-border/50"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => {
                if (loading) return;
                setCurrentPage(1);
                setReloadKey((k) => k + 1);
              }}
              className="border-primary/50"
            >
              {loading ? "Reloading…" : "Reload"}
            </Button>
            <Button
              variant={filterVerified ? "default" : "outline"}
              onClick={() => setFilterVerified(!filterVerified)}
              className={`border-primary/50 transition-transform duration-150 ${
                filterVerified ? "scale-105" : ""
              }`}
            >
              <Shield className="h-4 w-4 mr-2" />
              Verified Only
            </Button>
            <Button
              disabled={SHC_READ_ONLY}
              onClick={() => {
                if (!SHC_READ_ONLY) setShowSubmitModal(true);
              }}
              className="bg-primary text-primary-foreground transition-transform duration-150 hover:scale-105 active:scale-105 px-6 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              {SHC_READ_ONLY ? "Read-Only Mode" : "Add Block"}
            </Button>
          </div>
        </div>

        {/* ---- THREE-BUTTON NAV ---- */}
        {totalEntries > entriesPerPage && (
          <div className="flex items-center justify-between gap-4 mb-8 px-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-primary/50"
            >
              ← Newer Entries
            </Button>

            <div className="text-sm text-muted-foreground font-medium">
              Showing {rangeStart}–{rangeEnd} of {totalEntries}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-primary/50"
            >
              Older Entries →
            </Button>
          </div>
        )}

        {/* ---- LOADING / ERROR / EMPTY ---- */}
        {loading ? (
          <div className="text-center text-muted-foreground py-20">
            Loading entries from blockchain...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-20">{error}</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            No entries found. Add the first Sikh historical record!
          </div>
        ) : (
          <div className="space-y-6 mb-8">
            {paginatedEntries.map((entry) => (
              <Card
                key={entry.id}
                id={`entry-${entry.id}`}
                onClick={() => handleHashClick(entry)}
                className={`glass-effect border-border/50 gold-glow-hover transition-all cursor-pointer hover:scale-[1.01] ${
                  highlightedId === entry.id
                    ? "ring-2 ring-primary shadow-lg shadow-primary/20"
                    : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="font-serif text-2xl text-foreground">
                          {entry.title}
                        </CardTitle>
                        {entry.verified && (
                          <Badge className="bg-primary/20 text-primary border-primary/50">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified Contributor
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-base leading-relaxed line-clamp-3">
                        {entry.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      <span>Content Hash</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHashClick(entry);
                      }}
                      className="block w-full text-left text-sm bg-secondary/50 px-4 py-3 rounded font-mono text-primary break-all hover:bg-secondary/70 transition-colors"
                    >
                      {entry.hash || "No files uploaded"}
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground">Contributor: </span>
                        <span className="text-foreground font-medium">
                          {entry.contributorShort}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground">Source: </span>
                        <span className="text-foreground font-medium">{entry.source}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground">Added: </span>
                        <span className="text-foreground font-medium">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileType className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground">Type: </span>
                        <span className="text-foreground font-medium uppercase">
                          {entry.contentType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <code className="text-xs text-muted-foreground break-all">
                      {entry.contributor}
                    </code>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ---- FOOTER ---- */}
        <div className="mt-16 glass-effect rounded-xl p-8">
          <h3 className="font-serif text-2xl font-bold text-foreground mb-4 text-center">
            Community-Driven Verification
          </h3>
          <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-center">
            Every entry is cryptographically secured and permanently recorded.
            Verified contributors have their submissions automatically approved,
            while new entries undergo community review to ensure authenticity
            and prevent historical distortion.
          </p>
        </div>
      </div>

      {/* ---- MODALS ---- */}
      {selectedEntry && (
        <HashPreviewModal
          hash={selectedHash || ""}
          entry={selectedEntry}
          onClose={() => {
            setSelectedHash(null);
            setSelectedEntry(null);
          }}
        />
      )}

      {showSubmitModal && (
        <SubmitEntryModal onClose={() => setShowSubmitModal(false)} />
      )}
    </div>
  );
}
