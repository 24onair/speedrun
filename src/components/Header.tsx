"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "../i18n/navigation";

const NAV_ITEMS = [
  { key: "about", href: "/about" },
  { key: "register", href: "/register" },
  { key: "ranking", href: "/ranking" },
  { key: "livetrack", href: "/livetrack" },
  { key: "news", href: "/news" },
  { key: "gallery", href: "/gallery" },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const otherLocale = locale === "ko" ? "en" : "ko";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg-deep/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="display text-2xl font-bold tracking-wide text-fg"
          onClick={() => setOpen(false)}
        >
          SPEED<span className="text-accent"> RUN</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="main">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                pathname.startsWith(item.href) ? "text-accent" : "text-muted"
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={pathname}
            locale={otherLocale}
            className="hud rounded border border-line px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
            aria-label={otherLocale === "en" ? "Switch to English" : "한국어로 전환"}
          >
            {otherLocale === "en" ? "EN" : "한국어"}
          </Link>
          <Link href="/register" className="btn btn-primary hidden py-2 text-sm sm:inline-flex">
            {t("cta")}
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
            aria-expanded={open}
            aria-label="menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`h-0.5 w-5 bg-fg transition-transform ${open ? "translate-y-1 rotate-45" : ""}`} />
            <span className={`h-0.5 w-5 bg-fg transition-transform ${open ? "-translate-y-1 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-bg-deep lg:hidden" aria-label="mobile">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="border-b border-line/50 py-3 text-sm font-medium text-fg last:border-b-0"
                onClick={() => setOpen(false)}
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
