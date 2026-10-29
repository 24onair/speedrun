import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "../../../i18n/navigation";
import LoginForm from "../../../components/auth/LoginForm";

export default function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ signup?: string; error?: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const sp = use(searchParams);
  const t = useTranslations("auth");

  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start px-4 py-24">
      <p className="eyebrow mb-3">PIT LANE</p>
      <h1 className="display text-4xl font-bold sm:text-5xl">{t("loginTitle")}</h1>
      <p className="mt-3 text-muted">{t("loginSub")}</p>

      {sp.signup && (
        <p className="card mt-6 w-full max-w-sm border-good/40 p-4 text-sm text-good">
          {t("signupDone")}
        </p>
      )}
      {sp.error === "confirm" && (
        <p className="card mt-6 w-full max-w-sm border-accent/40 p-4 text-sm text-accent">
          {t("confirmError")}
        </p>
      )}

      <div className="mt-8 w-full">
        <LoginForm />
      </div>
      <p className="mt-6 text-sm text-muted">
        {t("noAccount")}{" "}
        <Link href="/signup" className="font-medium text-accent hover:underline">
          {t("goSignup")}
        </Link>
      </p>
    </section>
  );
}
