"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wallet, CheckCircle2, X } from "lucide-react";
import { readContract } from "thirdweb";
import {
  ConnectButton,
  useActiveAccount,
  useSendTransaction,
} from "thirdweb/react";
import { darkTheme } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { prepareContractCall } from "thirdweb";
import { client, ethSepolia } from "@/lib/thirdwebClient";
import { SHC_READ_ONLY } from "@/lib/shcSafety";

/* -----------------------------------------------------
   SUPPORTED WALLETS
----------------------------------------------------- */
const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
  createWallet("com.binance.wallet"),
  createWallet("com.trustwallet.app"),
  createWallet("com.blockchain.login"),
];

interface SubmitEntryModalProps {
  onClose: () => void;
}

/* -----------------------------------------------------
   SHA-256 (BROWSER SAFE)
----------------------------------------------------- */
async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* -----------------------------------------------------
   FILENAME VALIDATION (ROBUST)
----------------------------------------------------- */
function isValidFilename(name: string): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  if (!trimmed) return false;
  const baseName = trimmed.replace(/\.[^/.]+$/, "");
  return /[a-zA-Z0-9]/.test(baseName);
}

export function SubmitEntryModal({ onClose }: SubmitEntryModalProps) {
  const account = useActiveAccount();
  const [isVerified, setIsVerified] = useState(false);
  const { mutateAsync: sendTransaction } = useSendTransaction();

  const validatorContract = {
    client,
    chain: ethSepolia,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
    abi: [
      {
        type: "function",
        name: "isValidator",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ type: "bool" }],
      },
    ],
  };

  const ownerContract = {
    client,
    chain: ethSepolia,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
    abi: [
      {
        type: "function",
        name: "owner",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "address" }],
      },
    ],
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [dateError, setDateError] = useState("");
  const [fileError, setFileError] = useState("");
  const [disallowedFileError, setDisallowedFileError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contributorName: "",
    dateOfEvent: "",
    files: [] as File[],
    fileHashes: new Set<string>(),
  });

  /* -----------------------------------------------------
     RESET FORM ON MOUNT
  ----------------------------------------------------- */
  useEffect(() => {
    setFormData({
      title: "",
      description: "",
      contributorName: "",
      dateOfEvent: "",
      files: [],
      fileHashes: new Set(),
    });
    setDateError("");
    setFileError("");
    setIsSubmitting(false);
    setIsSuccess(false);
  }, []);

  /* -----------------------------------------------------
     CHECK VALIDATOR / OWNER
  ----------------------------------------------------- */
  useEffect(() => {
    async function checkVerification() {
      if (!account) {
        setIsVerified(false);
        return;
      }

      try {
        const [validator, owner] = await Promise.all([
          readContract({
            contract: validatorContract,
            method: "isValidator",
            params: [account.address],
          }),
          readContract({
            contract: ownerContract,
            method: "owner",
            params: [],
          }),
        ]);

        setIsVerified(
          Boolean(validator) ||
            owner.toLowerCase() === account.address.toLowerCase()
        );
      } catch (err) {
        console.error("Verification check failed:", err);
        setIsVerified(false);
      }
    }

    checkVerification();
  }, [account]);

  /* -----------------------------------------------------
     CID NORMALIZER
  ----------------------------------------------------- */
  const extractCID = (url: string): string => {
    if (!url) return "";
    return url
      .replace("ipfs://", "")
      .replace("https://gateway.pinata.cloud/ipfs/", "")
      .replace("https://ipfs.io/ipfs/", "")
      .replace("https://cloudflare-ipfs.com/ipfs/", "")
      .replace(/^ipfs\//, "")
      .trim();
  };

  /* -----------------------------------------------------
     PINATA UPLOAD
  ----------------------------------------------------- */
  const uploadFiles = async (
    files: File[]
  ): Promise<{ cid: string; name: string }[]> => {
    const fd = new FormData();
    files.forEach((file) => fd.append("file", file, file.name));

    const res = await fetch("/api/uploadToPinata", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Pinata upload failed response:", text);
      throw new Error("Pinata upload failed");
    }

    const data = await res.json();
    if (!data.uploads) throw new Error("Pinata response missing uploads");

    return data.uploads.map((u: any, idx: number) => ({
      cid: u.cid || u.IpfsHash || "",
      name: files[idx].name,
    }));
  };

  /* -----------------------------------------------------
     SUBMIT
  ----------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (SHC_READ_ONLY) {
    alert("Submissions are temporarily disabled. Archive is in read-only mode.");
    return;
    }

    if (!validateDate(formData.dateOfEvent)) return;

    if (!account) {
      alert("Please connect your wallet to submit.");
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedFiles: { cid: string; name: string }[] = [];

      if (formData.files.length > 0) {
        uploadedFiles = await uploadFiles(formData.files);
      }

      const storedHash = uploadedFiles
        .map((f) => extractCID(f.cid))
        .filter(Boolean)
        .join(",");

      const contract = {
        client,
        chain: ethSepolia,
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        abi: [
          {
            type: "function",
            name: "submitRecord",
            stateMutability: "nonpayable",
            inputs: [
              { name: "title", type: "string" },
              { name: "description", type: "string" },
              { name: "contributor", type: "string" },
              { name: "ipfsHash", type: "string" },
            ],
            outputs: [],
          },
        ],
      };


      // 🔐 Pack description + date into JSON payload
      const payload = JSON.stringify({
        description: formData.description,
        dateOfEvent: formData.dateOfEvent || "N/A",
      });

      const tx = prepareContractCall({
        contract,
        method: "submitRecord",
        params: [
          formData.title,
          payload, // 👈 JSON goes on-chain
          formData.contributorName || "Anonymous",
          storedHash,
        ],
      });

      const result = await sendTransaction(tx);

      console.log("RAW sendTransaction result:", result);

      const transactionHash =
        result?.transactionHash ||
        result?.receipt?.transactionHash ||
        result?.hash;
      console.log("RESOLVED tx hash:", transactionHash);

      // IMPORTANT: also store block index
      window.dispatchEvent(
        new CustomEvent("entrySubmitted", {
          detail: {
            transactionHash,
          },
        })
      );

      setIsSuccess(true);
      if (transactionHash) {
        // Persist locally so it survives reloads
        const existing = JSON.parse(
          localStorage.getItem("txHashes") || "{}"
        );

        // We don't know the ID yet, so store as "latest"
        existing.latest = transactionHash;

        localStorage.setItem("txHashes", JSON.stringify(existing));

        window.dispatchEvent(
          new CustomEvent("entrySubmitted", {
            detail: { transactionHash },
          })
        );
      }


    } catch (err: any) {
      console.error("❌ Blockchain error:", err);
      alert(
        "Error submitting record to blockchain: " +
          (err?.message || String(err))
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -----------------------------------------------------
     FILE HANDLING
  ----------------------------------------------------- */
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newFiles = Array.from(e.target.files || []);
    const baseAllowed = [".txt", ".md", ".pdf", ".jpg", ".png"];
    const allowed = isVerified ? [...baseAllowed, ".mp4"] : baseAllowed;

    const uniqueFiles: File[] = [];
    const newHashes = new Set(formData.fileHashes);
    const duplicates: string[] = [];
    const invalidFiles: string[] = [];
    const disallowedFiles: string[] = [];

    for (const file of newFiles) {
      if (!isValidFilename(file.name)) {
        invalidFiles.push(file.name || "<invalid>");
        continue;
      }

      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!allowed.includes(ext)) {
        disallowedFiles.push(file.name);
        continue;
      }

      const hash = await sha256Hex(await file.arrayBuffer());
      if (newHashes.has(hash)) {
        duplicates.push(file.name);
      } else {
        newHashes.add(hash);
        uniqueFiles.push(file);
      }
    }

    setFileError(
      invalidFiles.length > 0
        ? `Invalid file names (must contain letters or numbers): ${invalidFiles.join(
            ", "
          )}`
        : ""
    );

    setDisallowedFileError(
      disallowedFiles.length > 0
        ? `These file types are not allowed: ${disallowedFiles.join(
            ", "
          )}. Allowed: ${allowed.join(", ")}`
        : ""
    );

    if (duplicates.length > 0) {
      alert(`Duplicate files not allowed:\n${duplicates.join("\n")}`);
    }

    if (formData.files.length + uniqueFiles.length > 5) {
      alert("Max 5 files per submission.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...uniqueFiles],
      fileHashes: newHashes,
    }));

    e.target.value = "";
  };

  const removeFile = async (index: number) => {
    const file = formData.files[index];
    const hash = await sha256Hex(await file.arrayBuffer());

    const updatedHashes = new Set(formData.fileHashes);
    updatedHashes.delete(hash);

    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
      fileHashes: updatedHashes,
    }));
  };

  /* -----------------------------------------------------
     DATE VALIDATION
  ----------------------------------------------------- */
  const validateDate = (value: string) => {
    const regex = /^\d{2}\/\d{2}\/\d{2,4}$/;

    if (!value) {
      setDateError("Date is required");
      return false;
    }

    if (!regex.test(value)) {
      setDateError("Date must be in dd/mm/yy format (e.g., 15/04/1469)");
      return false;
    }

    setDateError("");
    return true;
  };

  /* -----------------------------------------------------
     SUCCESS MODAL
  ----------------------------------------------------- */
  if (isSuccess) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="glass-effect border-border/50">
          <div className="text-center py-8 space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Successfully Added to the Chain
            </h3>
            <p className="text-muted-foreground">
              Your entry has been recorded on the Sikh Historical Blockchain.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  /* -----------------------------------------------------
     FORM + CONNECT
  ----------------------------------------------------- */
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-effect border-border/50">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-foreground">
            Submit Historical Entry
          </DialogTitle>
          <DialogDescription>
            Add a new event, teaching, or contribution to the Sikh Historical Blockchain.
          </DialogDescription>
        </DialogHeader>

        {!account ? (
          <div className="py-8 text-center space-y-4">
            <Wallet className="mx-auto h-8 w-8 text-primary" />
            <h3 className="font-serif text-xl font-bold text-foreground">
              Connect Your Wallet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You must connect a wallet to submit entries to the blockchain.
            </p>

            <div className="flex justify-center mt-6">
              <div className="gold-glow-hover rounded-xl overflow-hidden">
                <ConnectButton
                  client={client}
                  chain={ethSepolia}
                  wallets={wallets}
                  connectButton={{
                    label: (
                      <div className="flex items-center justify-center gap-2">
                        <Wallet className="h-5 w-5 text-white" />
                        <span>Connect Wallet</span>
                      </div>
                    ),
                  }}
                  theme={darkTheme({
                    colors: {
                      accentText: "hsl(45, 29%, 97%)",
                      secondaryText: "hsl(45, 29%, 97%)",
                      tertiaryBg: "hsl(0, 0%, 11%)",
                      modalBg: "hsl(0, 0%, 0%)",
                      primaryButtonText: "hsl(45, 29%, 97%)",
                      primaryButtonBg: "hsl(42, 93%, 46%)",
                      accentButtonBg: "hsl(97, 83%, 54%)",
                    },
                  })}
                  connectModal={{
                    title: "Connect Wallet",
                    showThirdwebBranding: false,
                    size: "compact",
                  }}
                  className="!bg-[hsl(42,93%,46%)] !text-white !px-16 !py-5 !rounded-xl !text-lg !font-semibold !hover:bg-[hsl(42,93%,40%)] !transition-all !duration-300 !shadow-[0_0_15px_rgba(255,215,0,0.4)]"
                />
              </div>
            </div>
          </div>
) : (
  <form onSubmit={handleSubmit} className="space-y-6 mt-4">
    <div className="space-y-2">
      <Label htmlFor="title">Title</Label>

      <Input
        id="title"
        required
        placeholder="e.g., Battle of Chamkaur Sahib"
        value={formData.title}
        onChange={(e) =>
          setFormData({ ...formData, title: e.target.value })
        }
        autoComplete="new-password"
        autoCorrect="off"
        spellCheck={false}
        className="glass-effect border-border/50"
      />

    </div>

    <div className="space-y-2">
      <Label htmlFor="description">Description / Event Text</Label>
      <Textarea
        id="description"
        placeholder="Provide a detailed description..."
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        required
        rows={5}
        className="glass-effect border-border/50"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="contributorName">
        Contributor Name (Optional)
      </Label>
      <Input
        id="contributorName"
        placeholder="Your name or organisation"
        value={formData.contributorName}
        onChange={(e) =>
          setFormData({
            ...formData,
            contributorName: e.target.value,
          })
        }
        autoComplete="new-password"
        autoCorrect="off"
        spellCheck={false}
        className="glass-effect border-border/50"
      />
    </div>
<div className="space-y-2">
  <Label htmlFor="dateOfEvent">Date of Event (dd/mm/yy)</Label>
  <Input
    id="dateOfEvent"
    type="text"
    required
    placeholder="e.g., 06/12/1704"
    value={formData.dateOfEvent}
    onChange={(e) => {
      setFormData({
        ...formData,
        dateOfEvent: e.target.value,
      });
      validateDate(e.target.value);
    }}
    autoComplete="off"
    autoCorrect="off"
    spellCheck={false}
    inputMode="numeric"
    className="glass-effect border-border/50"
  />
  {dateError && (
    <p className="text-xs text-red-500">{dateError}</p>
  )}
</div>
    <div className="space-y-2">
      <Label>Upload Files (up to 5)</Label>
      <Input
        type="file"
        multiple
        accept={isVerified
          ? ".txt,.md,.pdf,.jpg,.png,.mp4"
          : ".txt,.md,.pdf,.jpg,.png"}
        onChange={handleFileChange}
        className="glass-effect border-border/50"
      />

      {!isVerified && (
        <p className="text-xs text-yellow-500">
          Video uploads (.mp4) are restricted to verified contributors.
        </p>
      )}

      {fileError && (
        <p className="text-xs text-red-500 mt-1">{fileError}</p>
      )}

      {disallowedFileError && (
        <p className="text-xs text-red-500 mt-1">{disallowedFileError}</p>
      )}

      <div className="flex flex-col gap-2 mt-2">
        {formData.files.map((file, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-yellow-600/10 border border-yellow-500/40 px-3 py-2 rounded-lg text-sm"
            style={{ color: "#14213d" }}
          >
            <span className="truncate">{file.name}</span>
            <button
              type="button"
              onClick={() => removeFile(i)}
              className="transition-transform duration-200 hover:scale-110"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Allowed: .txt, .md, .pdf, .jpg, .png
        {isVerified && ", .mp4"} (max 5 files per block)
      </p>
    </div>

            <div className="p-4 bg-secondary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Your submission will be reviewed before
                appearing publicly.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-primary/50 bg-transparent"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || SHC_READ_ONLY}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-[#faf9f6] rounded-xl py-5 text-base font-medium transition-all duration-300 shadow-md"
              >
                {SHC_READ_ONLY
                  ? "Read-Only Mode"
                  : isSubmitting
                  ? "Submitting..."
                  : "Submit to Blockchain"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
