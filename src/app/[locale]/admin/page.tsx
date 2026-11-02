import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "../../../i18n/navigation";
import { createClient } from "../../../lib/supabase/server";

/* 관리자 대시보드 — 오늘 처리할 일이 한눈에 */
export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const supabase = await createClient();

  const count = (table: string, filter?: { col: string; val: string }) => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) q = q.eq(filter.col, filter.val);
    return q;
  };

  const [pending, regs, pilots, records, posts, gallery] = await Promise.all([
    count("registrations", { col: "status", val: "pending" }),
    count("registrations"),
    count("profiles"),
    count("records"),
    count("posts"),
    count("gallery_items"),
  ]);

  const cards = [
    { key: "pending", value: pending.count ?? 0, href: "/admin/registrations?status=pending", hot: (pending.count ?? 0) > 0 },
    { key: "totalRegs", value: regs.count ?? 0, href: "/admin/registrations" },
    { key: "pilots", value: pilots.count ?? 0, href: "/admin/records" },
    { key: "records", value: records.count ?? 0, href: "/admin/records" },
    { key: "posts", value: posts.count ?? 0, href: "/admin/posts" },
    { key: "galleryItems", value: gallery.count ?? 0, href: "/admin/gallery" },
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.key}
          href={card.href}
          className={`card group p-5 transition-colors hover:border-accent ${
            "hot" in card && card.hot ? "border-accent/60" : ""
          }`}
        >
          <p className={`hud text-3xl ${"hot" in card && card.hot ? "text-accent" : "text-fg"}`}>
            {card.value}
          </p>
          <p className="mt-2 text-sm text-muted">{t(`dash.${card.key}`)}</p>
          <p className="hud mt-3 text-xs text-muted group-hover:text-accent">
            {t("dash.go")} <span aria-hidden>→</span>
          </p>
        </Link>
      ))}
    </div>
  );
}
