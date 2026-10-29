import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "../../../../i18n/navigation";

export default function RegisterDonePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("register.done");
  const tReg = useTranslations("register");

  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start px-4 py-24">
      <p className="eyebrow mb-3">ENTRY RECEIVED</p>
      <h1 className="display text-4xl font-bold sm:text-5xl">{t("title")}</h1>
      <p className="mt-3 max-w-xl text-muted">{t("lead")}</p>

      <div className="card mt-8 flex max-w-xl flex-col gap-4 p-6">
        <p className="display text-xl font-bold">{t("payTitle")}</p>
        <p className="text-sm leading-relaxed text-muted">{t("payBody")}</p>
        <p className="hud rounded border border-accent/40 bg-accent/10 p-4 text-sm">
          {tReg("bankAccount")}
        </p>
        <p className="text-sm text-muted">{t("statusNote")}</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/mypage" className="btn btn-primary text-sm">
          {t("goMypage")}
        </Link>
        <Link href="/" className="btn btn-ghost text-sm">
          {t("goHome")}
        </Link>
      </div>
    </section>
  );
}
