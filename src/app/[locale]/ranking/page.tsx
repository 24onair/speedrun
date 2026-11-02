import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "../../../i18n/navigation";
import Avatar from "../../../components/Avatar";
import { CLASSES } from "../../../lib/register-constants";
import { createClient, isSupabaseConfigured } from "../../../lib/supabase/server";
import { formatMs } from "../../../lib/time";

export type LeaderRow = {
  pilot_id: string;
  name: string;
  name_en: string | null;
  avatar_url: string | null;
  org: string | null;
  class: string;
  time_ms: number;
  flown_on: string;
};

function pilotName(row: LeaderRow, locale: string) {
  return locale === "en" && row.name_en ? row.name_en : row.name;
}

export default async function RankingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ranking");
  const format = await getFormatter();

  let rows: LeaderRow[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("leaderboard")
      .select("*")
      .order("time_ms", { ascending: true })
      .returns<LeaderRow[]>();
    rows = data ?? [];
  }

  const header = (
    <>
      <p className="eyebrow mb-3">{t("label")}</p>
      <h1 className="display text-4xl font-bold sm:text-5xl">{t("title")}</h1>
      <p className="mt-3 max-w-xl text-muted">{t("lead")}</p>
    </>
  );

  if (!rows.length) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-24">
        {header}
        <p className="card mt-8 max-w-xl p-6 text-sm text-muted">{t("empty")}</p>
      </section>
    );
  }

  const podium = rows.slice(0, 3);
  const cards = rows.slice(3, 10);
  const rest = rows.slice(10);
  // 포디움 시각 배치: md 이상 P2-P1-P3
  const podiumOrder = ["md:order-2 border-t-2 border-t-accent", "md:order-1 md:mt-8", "md:order-3 md:mt-8"];

  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      {header}

      {/* 종합 TOP 3 포디움 */}
      <h2 className="display mt-12 text-2xl font-bold">{t("overall")}</h2>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {podium.map((row, i) => (
          <Link
            key={row.pilot_id}
            href={`/pilots/${row.pilot_id}`}
            className={`card flex flex-col items-center p-6 text-center transition-colors hover:border-accent ${podiumOrder[i]}`}
          >
            <p className={`display text-2xl font-bold ${i === 0 ? "text-accent" : "text-muted"}`}>
              P{i + 1}
            </p>
            <Avatar name={pilotName(row, locale)} src={row.avatar_url} size={i === 0 ? 80 : 64} className="mt-4" />
            <p className="mt-4 font-bold">{pilotName(row, locale)}</p>
            <p className="hud mt-1 text-sm text-muted">{row.class}{row.org ? ` · ${row.org}` : ""}</p>
            <p className="hud mt-3 text-xl text-fg">{formatMs(row.time_ms)}</p>
          </Link>
        ))}
      </div>

      {/* 4~10위 사진 카드 */}
      {cards.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((row, i) => (
            <Link
              key={row.pilot_id}
              href={`/pilots/${row.pilot_id}`}
              className="card flex items-center gap-4 p-4 transition-colors hover:border-accent"
            >
              <p className="display w-9 text-xl font-bold text-muted">P{i + 4}</p>
              <Avatar name={pilotName(row, locale)} src={row.avatar_url} size={44} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{pilotName(row, locale)}</p>
                <p className="hud mt-0.5 text-xs text-muted">{row.class} · {formatMs(row.time_ms)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 11위~ 테이블 */}
      {rest.length > 0 && (
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">{t("overall")}</caption>
            <thead>
              <tr className="hud border-b border-line bg-panel-2/60 text-left text-xs text-muted">
                <th scope="col" className="px-5 py-3 font-medium">{t("rank")}</th>
                <th scope="col" className="px-5 py-3 font-medium">{t("pilot")}</th>
                <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">{t("classCol")}</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">{t("time")}</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((row, i) => (
                <tr key={row.pilot_id} className="border-b border-line/50 last:border-b-0">
                  <td className="hud px-5 py-3 text-muted">P{i + 11}</td>
                  <td className="px-5 py-3 font-medium">
                    <Link href={`/pilots/${row.pilot_id}`} className="hover:text-accent">
                      {pilotName(row, locale)}
                    </Link>
                  </td>
                  <td className="hud hidden px-5 py-3 text-muted sm:table-cell">{row.class}</td>
                  <td className="hud px-5 py-3 text-right">{formatMs(row.time_ms)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 클래스별 TOP 3 */}
      <h2 className="display mt-16 text-2xl font-bold">{t("byClass")}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {CLASSES.map((cls) => {
          const classRows = rows.filter((r) => r.class === cls).slice(0, 3);
          return (
            <div key={cls} className="card p-5">
              <p className="display border-b border-line pb-3 text-xl font-bold">{cls}</p>
              {!classRows.length ? (
                <p className="mt-4 text-sm text-muted">{t("empty")}</p>
              ) : (
                <ul className="mt-2">
                  {classRows.map((row, i) => (
                    <li key={row.pilot_id} className="flex items-center gap-3 border-b border-line/50 py-3 last:border-b-0">
                      <span className={`display w-8 text-lg font-bold ${i === 0 ? "text-accent" : "text-muted"}`}>
                        P{i + 1}
                      </span>
                      <Avatar name={pilotName(row, locale)} src={row.avatar_url} size={36} />
                      <Link href={`/pilots/${row.pilot_id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-accent">
                        {pilotName(row, locale)}
                      </Link>
                      <span className="hud text-sm">{formatMs(row.time_ms)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <p className="hud mt-6 text-xs text-muted">
        {format.dateTime(new Date(), { dateStyle: "medium" })} ·{" "}
        {rows.length} PILOTS
      </p>
    </section>
  );
}
