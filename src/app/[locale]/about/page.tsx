import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "../../../i18n/navigation";

export default function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("about");
  const taskItems = ["t1", "t2", "t3", "t4"] as const;
  const rules = ["r1", "r2", "r3", "r4", "r5", "r6"] as const;

  return (
    <>
      <section className="border-b border-line bg-bg-deep/60">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="eyebrow mb-3">{t("heroLabel")}</p>
          <h1 className="display text-5xl font-bold sm:text-6xl">{t("heroTitle")}</h1>
          <p className="mt-4 max-w-xl text-muted">{t("heroSub")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="eyebrow mb-3">{t("venue.label")}</p>
        <h2 className="display text-4xl font-bold">{t("venue.title")}</h2>
        <div className="mt-6 grid max-w-4xl gap-6 text-muted lg:grid-cols-2">
          <p className="leading-relaxed">{t("venue.p1")}</p>
          <p className="leading-relaxed">{t("venue.p2")}</p>
        </div>
      </section>

      <section className="border-y border-line bg-bg-deep/60">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="eyebrow mb-3">{t("task.label")}</p>
          <h2 className="display text-4xl font-bold">{t("task.title")}</h2>
          <div className="mt-6 grid max-w-4xl gap-6 text-muted lg:grid-cols-2">
            <p className="leading-relaxed">{t("task.p1")}</p>
            <p className="leading-relaxed">{t("task.p2")}</p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {taskItems.map((key, i) => (
              <div key={key} className="card p-5">
                <p className="hud text-xs text-accent">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-2 text-sm text-muted">{t(`task.items.${key}.k`)}</p>
                <p className="mt-1 font-bold">{t(`task.items.${key}.v`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="eyebrow mb-3">{t("rules.label")}</p>
        <h2 className="display text-4xl font-bold">{t("rules.title")}</h2>
        <p className="mt-4 max-w-xl text-muted">{t("rules.lead")}</p>
        <ul className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
          {rules.map((key) => (
            <li key={key} className="card flex items-center gap-3 p-4 text-sm">
              <span className="hud text-good" aria-hidden>✓</span>
              {t(`rules.${key}`)}
            </li>
          ))}
        </ul>
        <Link href="/register" className="btn btn-primary mt-10">
          {t("cta")} →
        </Link>
      </section>
    </>
  );
}
