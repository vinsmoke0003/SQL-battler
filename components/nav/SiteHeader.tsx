"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/toast/Toaster";

const links = [
  { href: "/practice", label: "Practice" },
  { href: "/mock", label: "Mock Tests" },
  { href: "/create", label: "Create Battle" },
  { href: "/join", label: "Join Battle" },
];

export function SiteHeader() {
  const pathname = usePathname();
  // The battle screen has its own compact top bar.
  const inBattle = pathname?.startsWith("/battle/") || /^\/mock\/[^/]+$/.test(pathname ?? "");

  return (
    <>
      {inBattle ? null : (
        <header className="border-b border-border bg-bg/80 backdrop-blur sticky top-0 z-30">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="grid size-7 place-items-center rounded-md bg-accent/15 text-accent">
                <Swords className="size-4" />
              </span>
              SQL Battle
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-muted transition-colors hover:text-text hover:bg-surface-2",
                    pathname === l.href && "text-text bg-surface-2",
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
      )}
      <Toaster />
    </>
  );
}
