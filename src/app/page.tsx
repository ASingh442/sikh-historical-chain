"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Shield,
  Users,
  Lock,
  BookOpen,
  History,
  Globe,
} from "lucide-react";
import { getContract } from "../lib/connectContract";

// ✅ Declare global window types
declare global {
  interface Window {
    ethereum?: any;
    contract?: any;
    getContract?: typeof getContract;
  }
}

// ✅ Attach getContract globally (so it’s accessible in browser console)
if (typeof window !== "undefined" && !window.getContract) {
  window.getContract = getContract;
}

export default function HomePage() {
  // 🔗 Initialize contract on page load
  useEffect(() => {
    (async () => {
      try {
        console.log("🟡 Initializing contract...");
        const contract = await getContract(false); // read-only mode
        window.contract = contract; // save globally for debugging
        console.log("✅ Contract loaded:", contract);
      } catch (err) {
        console.error("❌ Contract initialization failed:", err);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto px-4 bg-gradient-light min-h-screen">
      {/* 🔹 Hero Section */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center text-center py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center gold-glow mx-auto">
              <span className="text-[#050505] text-5xl font-bold">ੴ</span>
            </div>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Honoring the{" "}
            <span className="text-gradient-gold">Light of the Gurus</span> Through
            Blockchain
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            A decentralised archive starting with the teachings of Guru Nanak Dev
            Ji, preserving our faith, freedom, and legacy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/ledger">
              <Button
                size="lg"
                className="gold-glow-hover text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Enter the Archive
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-primary/50 text-foreground hover:bg-primary/10"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 🔹 Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            The Digital Sanctuary of Sikh History
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {[
              {
                icon: Shield,
                title: "Immutable Preservation",
                desc: "Blockchain ensures historical records remain authentic and tamper-proof.",
              },
              {
                icon: Users,
                title: "Community Governance",
                desc: "Sadh Sangat collectively validates and maintains records with transparency.",
              },
              {
                icon: Lock,
                title: "Secure Records",
                desc: "Cryptography ensures sacred knowledge can’t be altered or erased.",
              },
            ].map((f, i) => (
              <div key={i} className="glass-effect rounded-xl p-8 gold-glow-hover">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-4 text-foreground">
                  {f.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Educational Resource",
                desc: "A trusted platform for scholars to study Sikhi’s wisdom and impact.",
              },
              {
                icon: History,
                title: "Traceable History",
                desc: "Every event and teaching is permanently recorded to prevent distortion.",
              },
              {
                icon: Globe,
                title: "Global Access",
                desc: "Anyone, anywhere can verify and access authentic scriptures freely.",
              },
            ].map((f, i) => (
              <div key={i} className="glass-effect rounded-xl p-8 gold-glow-hover">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-4 text-foreground">
                  {f.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔹 Gurbani Quote */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto glass-effect rounded-2xl p-12 gold-glow text-center">
          <p className="font-serif text-2xl md:text-3xl text-primary leading-relaxed">
            ਸਤਿਨਾਮ ਕਰਤਾਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ
          </p>
          <p className="text-lg text-muted-foreground italic">
            Sat Naam Karta Purakh Nirbhau Nirvair
          </p>
          <p className="text-base text-muted-foreground">
            Truth is His Name, Creative Being Personified, Without Fear, Without
            Hatred
          </p>
          <p className="text-sm text-muted-foreground">
            — Mool Mantar, Guru Granth Sahib Ji
          </p>
        </div>
      </section>

      {/* 🔹 CTA */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Explore The Legacy Of The Sikh Panth
          </h2>
          <p className="text-lg text-muted-foreground">
            Guided by the Gurus, built to protect Sikh truth from distortion and
            silence.
          </p>
          <Link href="/blockchain">
            <Button
              size="lg"
              className="gold-glow-hover text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Explore
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 🔹 Footer */}
      <footer className="py-12 text-center border-t border-primary/20">
        <p className="text-muted-foreground">
          Every Record Immutable ✦ Every Update Traceable ✦ Every Truth Protected
          from Corruption
        </p>
      </footer>
    </div>
  );
}