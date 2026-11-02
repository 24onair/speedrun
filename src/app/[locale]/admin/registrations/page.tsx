import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "../../../../i18n/navigation";
import { setRegistrationStatus } from "../../../../lib/actions/admin";
import { createClient } from "../../../../lib/supabase/server";

type Reg = {
  id: string;
  class: string;
  status: "pending" | "confirmed" | "cancelled";
  depositor_name: string;
  created_at: string;
  profile: { name: string } | null;
  event: { title: string } | null;
};

const FILTERS = ["all", "pending", "confirmed", "cancelled"] as const;

export default async function AdminRegistrationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { status } = await searchParams;
  const active = FILTERS.includes(status as (typeof FILTERS)[number])
    ? (status as (typeof FILTERS)[number])
    : "all";

  const t = await getTranslations("admin");
  const tMy = await getTranslations("mypage");
  const supabase = await createClient();

  let query = supabase
    .from("registrations")
    .select("id, class, status, depositor_name, created_at, profile:profiles(name), event:events(title)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (active !== "all") query = query.eq("status", active);
  const { data: regs } = await query.returns<Reg[]>();

  const statusCls = {
    pending: "text-accent-hi",
    confirmed: "text-good",
    cancelled: "text-muted",
  } as const;

  return (
    <div>
      <h2 className="display text-2xl font-bold">{t("regsTitle")}</h2>

      {/* 상태 필터 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/admin/registrations" : `/admin/registrations?status=${f}`}
            className={`hud rounded border px-3 py-1.5 text-xs transition-colors ${
              active === f
                ? "border-accent bg-accent/10 text-accent"
                : "border-line text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {t(`filter.${f}`)}
          </Link>
        ))}
      </div>

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
    </div>
  );
}
