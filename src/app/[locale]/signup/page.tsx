import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "../../../i18n/navigation";
import SignupForm from "../../../components/auth/SignupForm";

export default function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("auth");

  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start px-4 py-24">
      <p className="eyebrow mb-3">NEW PILOT</p>
      <h1 className="display text-4xl font-bold sm:text-5xl">{t("signupTitle")}</h1>
      <p className="mt-3 text-muted">{t("signupSub")}</p>
      <div className="mt-8 w-full">
        <SignupForm />
      </div>
      <p className="mt-6 text-sm text-muted">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          {t("goLogin")}
        </Link>
      </p>
    </section>
  );
}
