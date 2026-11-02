import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "../../../i18n/navigation";
import RecordForm from "../../../components/admin/RecordForm";
import { deleteRecord, setRegistrationStatus } from "../../../lib/actions/admin";
import { createClient, isSupabaseConfigured } from "../../../lib/supabase/server";
import { formatMs } from "../../../lib/time";

type Reg = {
  id: string;
  class: string;
  status: "pending" | "confirmed" | "cancelled";
  depositor_name: string;
  created_at: string;
  profile: { name: string } | null;
  event: { title: string } | null;
};

type Rec = {
  id: string;
  class: string;
  time_ms: number;
  flown_on: string;
  profile: { name: string } | null;
};

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const tMy = await getTranslations("mypage");
  const format = await getFormatter();

  if (!isSupabaseConfigured()) redirect({ href: "/", locale });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: "/login", locale });
    return null;
  }
  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!me?.is_admin) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-24">
        <h1 className="display text-4xl font-bold">{t("title")}</h1>
        <p className="card mt-8 max-w-xl p-6 text-sm text-muted">{t("forbidden")}</p>
      </section>
    );
  }

  const [{ data: regs }, { data: pilots }, { data: events }, { data: records }] =
    await Promise.all([
      supabase
        .from("registrations")
        .select("id, class, status, depositor_name, created_at, profile:profiles(name), event:events(title)")
        .order("created_at", { ascending: false })
        .limit(50)
        .returns<Reg[]>(),
      supabase.from("profiles").select("id, name").order("name"),
      supabase.from("events").select("id, title, event_date").order("event_date", { ascending: false }),
      supabase
        .from("records")
        .select("id, class, time_ms, flown_on, profile:profiles(name)")
        .order("created_at", { ascending: false })
        .limit(20)
        .returns<Rec[]>(),
    ]);

  const statusCls = {
    pending: "text-accent-hi",
    confirmed: "text-good",
    cancelled: "text-muted",
  } as const;

  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <p className="eyebrow mb-3">RACE CONTROL</p>
      <h1 className="display text-4xl font-bold sm:text-5xl">{t("title")}</h1>

      {/* 참가신청 관리 */}
      <h2 className="display mt-12 text-2xl font-bold">{t("regsTitle")}</h2>
      <div className="card mt-4 overflow-x-auto">
        {!regs?.length ? (
          <p className="p-6 text-sm text-muted">{t("noRegs")}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="hud border-b border-line bg-panel-2/60 text-left text-xs text-muted">
                <th scope="col" className="px-4 py-3 font-medium">{t("pilot")}</th>
                <th scope="col" className="px-4 py-3 font-medium">{t("event")}</th>
                <th scope="col" className="px-4 py-3 font-medium">CLASS</th>
                <th scope="col" className="px-4 py-3 font-medium">{t("depositor")}</th>
                <th scope="col" className="px-4 py-3 font-medium">STATUS</th>
                <th scope="col" className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {regs.map((reg) => (
                <tr key={reg.id} className="border-b border-line/50 last:border-b-0">
                  <td className="px-4 py-3 font-medium">{reg.profile?.name}</td>
                  <td className="px-4 py-3 text-muted">{reg.event?.title}</td>
                  <td className="hud px-4 py-3 text-muted">{reg.class}</td>
                  <td className="px-4 py-3">{reg.depositor_name}</td>
                  <td className={`hud px-4 py-3 ${statusCls[reg.status]}`}>
                    {tMy(`status.${reg.status}`)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {reg.status !== "confirmed" && (
                        <form action={setRegistrationStatus.bind(null, reg.id, "confirmed")}>
                          <button className="btn btn-primary !px-3 py-1.5 text-xs">{t("confirm")}</button>
                        </form>
                      )}
                      {reg.status !== "cancelled" ? (
                        <form action={setRegistrationStatus.bind(null, reg.id, "cancelled")}>
                          <button className="btn btn-ghost px-3 py-1.5 text-xs">{t("cancel")}</button>
                        </form>
                      ) : (
                        <form action={setRegistrationStatus.bind(null, reg.id, "pending")}>
                          <button className="btn btn-ghost px-3 py-1.5 text-xs">{t("restore")}</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 기록 입력 */}
      <h2 className="display mt-14 text-2xl font-bold">{t("recordsTitle")}</h2>
      <div className="card mt-4 p-6">
        <RecordForm
          pilots={(pilots ?? []).map((p) => ({ id: p.id, label: p.name }))}
          events={(events ?? []).map((e) => ({ id: e.id, label: `${e.title} (${e.event_date})` }))}
        />
      </div>

      {/* 최근 기록 */}
      <h2 className="display mt-14 text-2xl font-bold">{t("recentRecords")}</h2>
      <div className="card mt-4 overflow-x-auto">
        {!records?.length ? (
          <p className="p-6 text-sm text-muted">{t("noRecords")}</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id} className="border-b border-line/50 last:border-b-0">
                  <td className="px-4 py-3 font-medium">{rec.profile?.name}</td>
                  <td className="hud px-4 py-3 text-muted">{rec.class}</td>
                  <td className="hud px-4 py-3">{formatMs(rec.time_ms)}</td>
                  <td className="hud px-4 py-3 text-muted">
                    {format.dateTime(new Date(rec.flown_on), { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteRecord.bind(null, rec.id)}>
                      <button className="btn btn-ghost px-3 py-1.5 text-xs">{t("delete")}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
