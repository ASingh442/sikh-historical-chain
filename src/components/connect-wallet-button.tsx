"use client";

import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client, ethSepolia } from "@/lib/thirdwebClient";

export default function ConnectWalletButton() {
  const account = useActiveAccount();

  return (
    <div className="flex items-center justify-center">
      <ConnectButton
        client={client}
        chain={ethSepolia}
        theme="dark"
        connectModal={{
          size: "wide",
          title: "Connect Your Wallet",
        }}
      />

      {account && (
        <p className="ml-4 text-sm text-muted-foreground">
          Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </p>
      )}
    </div>
  );
}
