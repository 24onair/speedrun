import { useLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "../../i18n/navigation";
import HeroVideo from "../../components/HeroVideo";
import { OVERALL_TOP } from "../../lib/sample-data";

export default function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <WaypointTicker />
      <Circuit />
      <Classes />
      <Leaderboard />
      <Season />
      <News />
      <CtaBand />
    </>
  );
}

function Hero() {
  const t = useTranslations("hero");
  return (
    <section className="relative overflow-hidden">
      <HeroVideo />
      <div className="absolute inset-0 bg-gradient-to-b from-bg-deep/75 via-bg-deep/55 to-bg" />
      <div className="relative mx-auto flex min-h-[82svh] max-w-6xl flex-col justify-end px-4 pb-20 pt-28">
        <p className="eyebrow mb-5">{t("eyebrow")}</p>
        <h1 className="display text-5xl font-bold sm:text-7xl lg:text-8xl">
          {t("slogan1")}
          <br />
          <span className="text-accent">{t("slogan2")}</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-fg/85 sm:text-lg">
          {t("sub")}
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link href="/register" className="btn btn-primary">
            {t("cta")} <span aria-hidden>→</span>
          </Link>
          <Link href="/about" className="btn btn-ghost">
            {t("cta2")}
          </Link>
          <span className="hud ml-1 inline-flex items-center gap-2 text-xs text-good">
            <span className="h-2 w-2 animate-pulse rounded-full bg-good" aria-hidden />
            {t("seasonBadge")}
          </span>
        </div>
      </div>
    </section>
  );
}

function WaypointTicker() {
  const items = Array.from({ length: 11 }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `WP ${n} ✓`;
  });
  const row = [...items, "FINISH 🏁"];
  return (
    <div className="overflow-hidden border-y border-line bg-bg-deep" aria-hidden>
      <div className="ticker-track flex w-max">
        {[0, 1].map((half) => (
          <div key={half} className="flex">
            {row.map((label, i) => (
              <span
                key={`${half}-${i}`}
                className="hud whitespace-nowrap border-r border-line/60 px-8 py-3 text-xs text-muted"
              >
                {label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Circuit() {
  const t = useTranslations("circuit");
  const stats = ["years", "waypoints", "classes", "attempts"] as const;
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <p className="eyebrow mb-3">{t("label")}</p>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h2 className="display text-4xl font-bold sm:text-5xl">{t("title")}</h2>
          <p className="mt-5 max-w-xl leading-relaxed text-muted">{t("lead")}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((key) => (
            <div key={key} className="card p-5">
              <p className="hud text-3xl font-medium text-accent">
                {t(`stats.${key}.value`)}
              </p>
              <p className="mt-2 text-sm text-muted">{t(`stats.${key}.label`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Classes() {
  const t = useTranslations("classes");
  const classes = ["b", "c", "d"] as const;
  return (
    <section className="border-y border-line bg-bg-deep/60">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <p className="eyebrow mb-3">{t("label")}</p>
        <h2 className="display text-4xl font-bold sm:text-5xl">{t("title")}</h2>
        <p className="mt-4 max-w-xl text-muted">{t("lead")}</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {classes.map((key, i) => (
            <div key={key} className="card border-t-2 border-t-accent p-6">
              <p className="hud text-xs text-muted">CLASS {i + 1}</p>
              <p className="display mt-2 text-3xl font-bold">{t(`${key}.name`)}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{t(`${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Leaderboard() {
  const t = useTranslations("leaderboard");
  const locale = useLocale();
  const [p1, p2, p3, ...rest] = OVERALL_TOP;
  // DOM은 P1 먼저(모바일 1열·스크린리더 순서), md 이상에서만 P2-P1-P3 포디움 배치
  const podium = [
    { entry: p1, cls: "md:order-2 border-t-2 border-t-accent" },
    { entry: p2, cls: "md:order-1 md:mt-6" },
    { entry: p3, cls: "md:order-3 md:mt-6" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">{t("label")}</p>
          <h2 className="display text-4xl font-bold sm:text-5xl">{t("title")}</h2>
          <p className="mt-4 max-w-xl text-muted">{t("lead")}</p>
        </div>
        <Link href="/ranking" className="btn btn-ghost text-sm">
          {t("viewAll")} <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="mt-12 grid gap-3 md:grid-cols-3">
        {podium.map(({ entry, cls }) => (
          <div key={entry.rank} className={`card flex flex-col items-center p-6 text-center ${cls}`}>
            <p className={`display text-2xl font-bold ${entry.rank === 1 ? "text-accent" : "text-muted"}`}>
              P{entry.rank}
            </p>
            <div
              className="mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-sky text-xl font-black text-bg-deep"
              aria-hidden
            >
              {(locale === "en" ? entry.nameEn : entry.name).charAt(0)}
            </div>
            <p className="mt-4 font-bold">{locale === "en" ? entry.nameEn : entry.name}</p>
            <p className="hud mt-1 text-sm text-muted">{entry.cls}</p>
            <p className="hud mt-3 text-xl text-fg">{entry.time}</p>
          </div>
        ))}
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">{t("title")}</caption>
          <thead>
            <tr className="hud border-b border-line bg-panel-2/60 text-left text-xs text-muted">
              <th scope="col" className="px-5 py-3 font-medium">{t("rank")}</th>
              <th scope="col" className="px-5 py-3 font-medium">{t("pilot")}</th>
              <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">CLASS</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">{t("time")}</th>
            </tr>
          </thead>
          <tbody>
            {rest.map((r) => (
              <tr key={r.rank} className="border-b border-line/50 last:border-b-0">
                <td className="hud px-5 py-3 text-muted">P{r.rank}</td>
                <td className="px-5 py-3 font-medium">
                  {locale === "en" ? r.nameEn : r.name}
                </td>
                <td className="hud hidden px-5 py-3 text-muted sm:table-cell">{r.cls}</td>
                <td className="hud px-5 py-3 text-right">{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hud mt-3 text-xs text-muted">{t("sampleNote")}</p>
    </section>
  );
}

function Season() {
  const t = useTranslations("season");
  const bullets = ["b1", "b2", "b3"] as const;
  return (
    <section className="border-y border-line bg-bg-deep/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-24 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="eyebrow mb-3">{t("label")}</p>
          <h2 className="display text-4xl font-bold sm:text-5xl">{t("title")}</h2>
          <p className="mt-5 max-w-xl leading-relaxed text-muted">{t("body")}</p>
          <Link href="/register" className="btn btn-primary mt-8">
            {t("cta")} <span aria-hidden>→</span>
          </Link>
        </div>
        <ul className="flex flex-col justify-center">
          {bullets.map((key, i) => (
            <li key={key} className="flex items-center gap-4 border-b border-line/60 py-4 first:border-t">
              <span className="hud text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-sm text-fg">{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function News() {
  const t = useTranslations("news");
  const items = ["n1", "n2", "n3"] as const;
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">{t("label")}</p>
          <h2 className="display text-4xl font-bold sm:text-5xl">{t("title")}</h2>
        </div>
        <Link href="/news" className="btn btn-ghost text-sm">
          {t("viewAll")} <span aria-hidden>→</span>
        </Link>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {items.map((key) => (
          <Link key={key} href="/news" className="card group p-6 transition-colors hover:border-accent">
            <span className="tag">{t(`items.${key}.tag`)}</span>
            <p className="mt-4 font-bold leading-snug group-hover:text-accent">
              {t(`items.${key}.title`)}
            </p>
            <p className="hud mt-3 text-xs text-muted">{t(`items.${key}.date`)}</p>
          </Link>
        ))}
      </div>
      <p className="hud mt-3 text-xs text-muted">{t("sampleNote")}</p>
    </section>
  );
}

function CtaBand() {
  const t = useTranslations("ctaBand");
  return (
    <section className="relative overflow-hidden border-t border-line bg-bg-deep">
      <div className="checker absolute inset-x-0 top-0" aria-hidden />
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <h2 className="display text-5xl font-bold sm:text-6xl">{t("title")}</h2>
        <p className="mt-4 text-muted">{t("body")}</p>
        <Link href="/register" className="btn btn-primary mt-8 px-10 py-4 text-base">
          {t("cta")} <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
