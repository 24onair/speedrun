import { useTranslations } from "next-intl";
import { Link } from "../i18n/navigation";

export default function ComingSoon({ pageKey }: { pageKey: string }) {
  const t = useTranslations("comingSoon");
  const nav = useTranslations("nav");

  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start px-4 py-32">
      <span className="tag">{t("badge")}</span>
      <h1 className="display mt-5 text-4xl font-bold sm:text-5xl">
        {nav(pageKey)} — {t("title")}
      </h1>
      <p className="mt-4 max-w-md text-muted">{t("body")}</p>
      <Link href="/" className="btn btn-ghost mt-8">
        ← {t("back")}
      </Link>
    </section>
  );
}
