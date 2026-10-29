import { useTranslations } from "next-intl";
import { Link } from "../i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="border-t border-line bg-bg-deep">
      <div className="checker" aria-hidden />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="display text-2xl font-bold">
            SPEED<span className="text-accent"> RUN</span>
          </p>
          <p className="hud mt-2 text-xs uppercase tracking-widest text-muted">
            {t("tagline")}
          </p>
          <p className="mt-4 text-sm text-muted">{t("org")}</p>
        </div>
        <div>
          <p className="eyebrow mb-4">{t("menu")}</p>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link className="hover:text-accent" href="/about">{nav("about")}</Link></li>
            <li><Link className="hover:text-accent" href="/register">{nav("register")}</Link></li>
            <li><Link className="hover:text-accent" href="/ranking">{nav("ranking")}</Link></li>
            <li><Link className="hover:text-accent" href="/news">{nav("news")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">{t("contact")}</p>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <a
                className="hover:text-accent"
                href="https://www.youtube.com/@limitedgabi"
                target="_blank"
                rel="noreferrer"
              >
                {t("youtube")}
              </a>
            </li>
            <li>speedrun.asia</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line/60">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted">{t("copyright")}</p>
      </div>
    </footer>
  );
}
