import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

const FLYMASTER_URL =
  "https://lt.flymaster.net/bs.php?grp=7138&pwd=d07c572f7f0a5b42e8dd385de00775";
const WINDGURU_URL = "https://www.windguru.cz/230999";

export default function LivetrackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("livetrack");

  const cards = [
    { key: "flymaster", url: FLYMASTER_URL },
    { key: "windguru", url: WINDGURU_URL },
  ] as const;

  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <p className="eyebrow mb-3">{t("label")}</p>
      <h1 className="display text-4xl font-bold sm:text-5xl">{t("title")}</h1>
      <p className="mt-3 max-w-xl text-muted">{t("lead")}</p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {cards.map(({ key, url }) => (
          <div key={key} className="card flex flex-col items-start p-7">
            <span className="tag">{t(`${key}.tag`)}</span>
            <p className="display mt-4 text-2xl font-bold">{t(`${key}.title`)}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t(`${key}.desc`)}</p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary mt-6 text-sm"
            >
              {t(`${key}.cta`)} <span aria-hidden>→</span>
            </a>
          </div>
        ))}
      </div>

      <p className="hud mt-6 text-xs text-muted">{t("note")}</p>
    </section>
  );
}
