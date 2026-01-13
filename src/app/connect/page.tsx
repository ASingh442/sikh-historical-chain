"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Shield, Zap, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { darkTheme } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
  createWallet("com.binance.wallet"),
  createWallet("com.trustwallet.app"),
  createWallet("com.blockchain.login"),
];

export default function ConnectPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center gold-glow mx-auto">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
            Connect Your Wallet
          </h1>
          <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
            Access the Sikh Historical Chain and explore the true history on the blockchain
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8 glass-effect border-primary/30">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-muted-foreground">
            Connecting your wallet allows you to verify event authenticity, view blockchain records, and
            participate in the preservation of Sikh heritage free from third parties.
          </AlertDescription>
        </Alert>

        {/* Connect Card */}
        <Card className="glass-effect border-border/50 gold-glow mb-8">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-serif text-2xl">Web3 Wallet Connection</CardTitle>
            <CardDescription>
              Connect using MetaMask, WalletConnect, or other Web3 wallets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="gold-glow-hover rounded-xl overflow-hidden">
                <ConnectButton
                  client={client}
                  wallets={wallets}
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
            <p className="text-center text-sm text-muted-foreground">
              By connecting, you agree to our terms of service and privacy policy.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="glass-effect border-border/50 gold-glow-hover">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground mb-2">Secure & Private</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your wallet connection is secure and private. We never store your private keys or personal
                information.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border/50 gold-glow-hover">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground mb-2">Instant Access</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Once connected, instantly verify scripture hashes and explore the complete blockchain archive.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have a wallet?{" "}
            <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Get MetaMask
            </a>{" "}
            or{" "}
            <a href="https://walletconnect.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Learn about WalletConnect
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
