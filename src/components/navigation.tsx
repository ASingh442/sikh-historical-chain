"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/ledger", label: "Ledger" },
  { href: "/blockchain", label: "Blockchain" },
  { href: "/about", label: "About" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-effect border-b border-border/50">
      <div className="container mx-auto px-24">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-6 group">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center gold-glow-hover">
              <span className="text-primary-foreground font-bold text-sm">ੴ</span>
            </div>
            <span className="font-serif font-bold text-lg text-foreground">Sikh Historical Chain</span>
          </Link>

          <div className="flex items-center space-x-9 mr-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/connect"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm gold-glow-hover border border-primary/20"
            >
              Connect Wallet
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
