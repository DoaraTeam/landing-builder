"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutTemplate, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#templates", label: "Templates" },
  { href: "#how-it-works", label: "How it works" },
];

export function BuilderHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 px-4 backdrop-blur">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutTemplate className="h-4 w-4" />
          </span>
          Landing Page Builder
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        <Button size="sm" className="gap-1.5" onClick={() => router.push("/editor")}>
          Start building <MoveRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </header>
  );
}
