"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "../../i18n/navigation";

const ITEMS = [
  { key: "dashboard", href: "/admin" },
  { key: "registrations", href: "/admin/registrations" },
  { key: "records", href: "/admin/records" },
  { key: "posts", href: "/admin/posts" },
  { key: "gallery", href: "/admin/gallery" },
] as const;

/* 관리자 좌측 탭 (모바일에선 상단 가로 스크롤 탭) */
export default function AdminNav() {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav
      aria-label={t("dashboard")}
      className="flex gap-1 overflow-x-auto border-b border-line pb-2 lg:flex-col lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4"
    >
      {ITEMS.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={`whitespace-nowrap rounded px-4 py-2.5 text-sm font-medium transition-colors ${
            isActive(item.href)
              ? "bg-accent/10 text-accent"
              : "text-muted hover:bg-panel hover:text-fg"
          }`}
        >
          {t(item.key)}
        </Link>
      ))}
    </nav>
  );
}
