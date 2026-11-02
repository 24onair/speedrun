import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "../../../i18n/navigation";
import AvatarUploader from "../../../components/auth/AvatarUploader";
import { signOut } from "../../../lib/actions/auth";
import { createClient, isSupabaseConfigured } from "../../../lib/supabase/server";

type RegRow = {
  id: string;
  class: string;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  event: { title: string; event_date: string } | null;
};

export default async function MyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("mypage");
  const tAuth = await getTranslations("auth");
  const format = await getFormatter();

  if (!isSupabaseConfigured()) {
    redirect({ href: "/", locale });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: "/login", locale });
    return null;
  }

  const [{ data: profile }, { data: regs }] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, phone, org, glider, license, class, avatar_url")
      .eq("id", user.id)
      .single(),
    supabase
      .from("registrations")
      .select("id, class, status, created_at, event:events(title, event_date)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<RegRow[]>(),
  ]);

  const fields = [
    ["name", profile?.name],
    ["phone", profile?.phone],
    ["org", profile?.org],
    ["glider", profile?.glider],
    ["license", profile?.license],
    ["class", profile?.class],
  ] as const;

  const statusCls: Record<RegRow["status"], string> = {
    pending: "text-accent-hi",
    confirmed: "text-good",
    cancelled: "text-muted",
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">PILOT</p>
          <h1 className="display text-4xl font-bold sm:text-5xl">{t("title")}</h1>
          <p className="hud mt-3 text-sm text-muted">{user.email}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="btn btn-ghost text-sm">
            {tAuth("logout")}
          </button>
        </form>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* 프로필 */}
        <div className="card p-6">
          <p className="display text-xl font-bold">{t("profileTitle")}</p>
          <div className="mt-4">
            <AvatarUploader
              userId={user.id}
              name={profile?.name ?? ""}
              avatarUrl={profile?.avatar_url ?? null}
            />
          </div>
          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
            {fields.map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="hud text-muted">{t(`fields.${key}`)}</dt>
                <dd className={value ? "" : "text-muted"}>{value || t("empty")}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* 신청 내역 */}
        <div className="card p-6">
          <p className="display text-xl font-bold">{t("regTitle")}</p>
          {!regs?.length ? (
            <div className="mt-4 flex flex-col items-start gap-4">
              <p className="text-sm text-muted">{t("noRegs")}</p>
              <Link href="/register" className="btn btn-primary text-sm">
                {t("goRegister")}
              </Link>
            </div>
          ) : (
            <ul className="mt-4 flex flex-col">
              {regs.map((reg) => (
                <li
                  key={reg.id}
                  className="flex items-center justify-between gap-4 border-b border-line/60 py-3 last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{reg.event?.title}</p>
                    <p className="hud mt-0.5 text-xs text-muted">
                      {reg.event
                        ? format.dateTime(new Date(reg.event.event_date), {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}{" "}
                      · {reg.class}
                    </p>
                  </div>
                  <span className={`hud text-sm ${statusCls[reg.status]}`}>
                    {t(`status.${reg.status}`)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
