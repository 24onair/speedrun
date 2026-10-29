import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "../../../i18n/navigation";
import RegisterForm from "../../../components/register/RegisterForm";
import { createClient, isSupabaseConfigured } from "../../../lib/supabase/server";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("register");

  const header = (
    <>
      <p className="eyebrow mb-3">ENTRY</p>
      <h1 className="display text-4xl font-bold sm:text-5xl">{t("title")}</h1>
      <p className="mt-3 max-w-xl text-muted">{t("sub")}</p>
    </>
  );

  if (!isSupabaseConfigured()) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-24">
        {header}
        <p className="card mt-8 max-w-xl p-6 text-sm text-muted">{t("notConfigured")}</p>
      </section>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const tAuth = await getTranslations("auth");
    return (
      <section className="mx-auto max-w-6xl px-4 py-24">
        {header}
        <div className="card mt-8 flex max-w-xl flex-col items-start gap-4 p-6">
          <p className="text-sm text-muted">{t("loginRequired")}</p>
          <div className="flex gap-3">
            <Link href="/login" className="btn btn-primary text-sm">
              {tAuth("goLogin")}
            </Link>
            <Link href="/signup" className="btn btn-ghost text-sm">
              {tAuth("goSignup")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const [{ data: event }, { data: profile }] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, event_date")
      .eq("status", "open")
      .order("event_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("name, org, glider, license, class")
      .eq("id", user.id)
      .single(),
  ]);

  if (!event) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-24">
        {header}
        <p className="card mt-8 max-w-xl p-6 text-sm text-muted">{t("noEvent")}</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      {header}
      <RegisterForm
        event={event}
        profile={profile ?? { name: "", org: null, glider: null, license: null, class: null }}
      />
    </section>
  );
}
