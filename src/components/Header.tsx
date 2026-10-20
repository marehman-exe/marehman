"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { profile } from "@/data/profile";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/journey", label: "Journey" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/cv", label: "CV" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close menu on route change — intentional synchronous reset on pathname change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.classList.toggle("mobile-nav-open", mobileOpen);
    return () => document.body.classList.remove("mobile-nav-open");
  }, [mobileOpen]);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-3">
        {/* Logo / name */}
        <Link href="/" className="group flex items-center gap-2 shrink-0">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full bg-live transition-transform duration-200 group-hover:scale-125"
          />
          <span className="font-display text-sm font-medium text-ink">
            {profile.name}
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Main navigation" className="hidden items-center gap-1 sm:flex sm:gap-2">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={[
                "rounded-sm px-2 py-1 font-mono text-xs uppercase tracking-[0.08em] transition-colors",
                isActive(href)
                  ? "text-signal"
                  : "text-muted hover:text-ink",
              ].join(" ")}
            >
              {label}
            </Link>
          ))}
          <span className="ml-1">
            <ThemeToggle />
          </span>
        </nav>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-line text-ink transition-colors hover:border-signal"
          >
            <span aria-hidden className="font-mono text-xs">
              {mobileOpen ? "×" : "≡"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="border-t border-line bg-paper sm:hidden"
        >
          <nav
            aria-label="Mobile navigation"
            className="mx-auto flex max-w-content flex-col px-6 py-4"
          >
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={[
                  "border-b border-line py-3 font-mono text-xs uppercase tracking-[0.08em] transition-colors",
                  isActive(href) ? "text-signal" : "text-muted hover:text-ink",
                ].join(" ")}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
