"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteNavigation } from "@/lib/placeholders";

const joinOptions = [
  { href: "/join/creator", label: "Become a Creator" },
  { href: "/join/studio-member", label: "Become a Studio Member" },
  { href: "/join/manager", label: "Apply as Manager" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-black/60 backdrop-blur-xl">
      <div className="page-shell flex items-center justify-between gap-6 py-5">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-black tracking-[0.08em] text-white">
            BimBoy Studios
          </Link>
          <nav className="hidden items-center gap-2 lg:flex">
            {siteNavigation.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/62 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-white/20"
          >
            Login
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((current) => !current)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110"
            >
              Join Beta
              <span
                className={`text-xs transition ${menuOpen ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+0.75rem)] w-64 overflow-hidden rounded-[24px] border border-white/10 bg-[#0b0b10]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl"
              >
                {joinOptions.map((option) => (
                  <Link
                    key={option.href}
                    href={option.href}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-sm font-medium text-white/78 transition hover:bg-white/8 hover:text-white"
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
