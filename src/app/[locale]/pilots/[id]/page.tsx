import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "../../../../i18n/navigation";
import Avatar from "../../../../components/Avatar";
import { createClient, isSupabaseConfigured } from "../../../../lib/supabase/server";
import { formatMs } from "../../../../lib/time";

type Profile = {
  id: string;
  name: string;
  name_en: string | null;
  avatar_url: string | null;
  org: string | null;
  glider: string | null;
  license: string | null;
  class: string | null;
};

type Rec = { id: string; class: string; time_ms: number; flown_on: string; event: { title: string } | null };

export default async function PilotPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pilots");
  const tMy = await getTranslations("mypage");
  const format = await getFormatter();

  let profile: Profile | null = null;
  let records: Rec[] = [];
  if (isSupabaseConfigured() && /^[0-9a-f-]{36}$/.test(id)) {
    const supabase = await createClient();
    const [p, r] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, name, name_en, avatar_url, org, glider, license, class")
        .eq("id", id)
        .maybeSingle<Profile>(),
      supabase
        .from("records")
        .select("id, class, time_ms, flown_on, event:events(title)")
        .eq("pilot_id", id)
        .order("time_ms", { ascending: true })
        .limit(30)
        .returns<Rec[]>(),
    ]);
    profile = p.data;
    records = r.data ?? [];
  }

  if (!profile) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-24">
        <p className="card max-w-xl p-6 text-sm text-muted">{t("notFound")}</p>
        <Link href="/ranking" className="btn btn-ghost mt-6 text-sm">
          <span aria-hidden>←</span> {t("backToRanking")}
        </Link>
      </section>
    );
  }

  const name = locale === "en" && profile.name_en ? profile.name_en : profile.name;
  const best = records[0];

  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <p className="eyebrow mb-3">{t("label")}</p>
      <div className="flex flex-wrap items-center gap-6">
        <Avatar name={name} src={profile.avatar_url} size={96} />
        <div>
          <h1 className="display text-4xl font-bold sm:text-5xl">{name}</h1>
          <p className="hud mt-2 text-sm text-muted">
            {[profile.class, profile.org, profile.glider].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* 베스트 + 상세 */}
        <div className="card p-6">
          <p className="display text-xl font-bold">{t("bestTitle")}</p>
          <p className="hud mt-3 text-4xl text-accent">
            {best ? formatMs(best.time_ms) : "—"}
          </p>
          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
            {([
              ["org", profile.org],
              ["glider", profile.glider],
              ["license", profile.license],
              ["class", profile.class],
            ] as const).map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="hud text-muted">{tMy(`fields.${key}`)}</dt>
                <dd className={value ? "" : "text-muted"}>{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* 시즌 기록 */}
        <div className="card p-6">
          <p className="display text-xl font-bold">{t("recordsTitle")}</p>
          {!records.length ? (
            <p className="mt-4 text-sm text-muted">{t("noRecords")}</p>
          ) : (
            <ul className="mt-2">
              {records.map((rec, i) => (
                <li key={rec.id} className="flex items-center gap-4 border-b border-line/50 py-3 last:border-b-0">
                  <span className={`hud w-8 text-sm ${i === 0 ? "text-accent" : "text-muted"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="hud text-base">{formatMs(rec.time_ms)}</span>
                  <span className="hud flex-1 truncate text-xs text-muted">
                    {rec.class} · {rec.event?.title ?? ""}
                  </span>
                  <span className="hud text-xs text-muted">
                    {format.dateTime(new Date(rec.flown_on), { month: "short", day: "numeric" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Link href="/ranking" className="btn btn-ghost mt-10 text-sm">
        <span aria-hidden>←</span> {t("backToRanking")}
      </Link>
    </section>
  );
}
