"use client";

import React, { Suspense } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { AppProviders } from "@/providers/AppProviders";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${inter.variable} ${playfair.variable} ${GeistMono.variable} antialiased`}
      >
        <AppProviders>
          <div className="min-h-screen bg-gradient-light relative overflow-hidden">
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
              <div className="absolute top-20 left-20 w-96 h-96 bg-primary rounded-full blur-3xl" />
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl" />
            </div>

            <div className="fixed inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none text-[40rem] font-bold text-primary">
              ੴ
            </div>

            <Suspense fallback={<div>Loading...</div>}>
              <Navigation />
            </Suspense>

            <main className="relative z-10 pt-20">{children}</main>

            <footer className="relative z-10 border-t border-border/50 mt-20">
              <div className="container mx-auto px-4 py-8">
                <p className="text-center text-muted-foreground text-sm">
                  Built with Faith ✦ Guided by Light ✦ Preserving the Eternal Word
                </p>
              </div>
            </footer>
          </div>
          <Analytics />
        </AppProviders>
      </body>
    </html>
  );
}
