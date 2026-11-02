import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import RecordForm from "../../../../components/admin/RecordForm";
import { deleteRecord } from "../../../../lib/actions/admin";
import { createClient } from "../../../../lib/supabase/server";
import { formatMs } from "../../../../lib/time";

type Rec = {
  id: string;
  class: string;
  time_ms: number;
  flown_on: string;
  profile: { name: string } | null;
};

export default async function AdminRecordsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const format = await getFormatter();
  const supabase = await createClient();

  const [{ data: pilots }, { data: events }, { data: records }] = await Promise.all([
    supabase.from("profiles").select("id, name").order("name"),
    supabase.from("events").select("id, title, event_date").order("event_date", { ascending: false }),
    supabase
      .from("records")
      .select("id, class, time_ms, flown_on, profile:profiles(name)")
      .order("created_at", { ascending: false })
      .limit(30)
      .returns<Rec[]>(),
  ]);

  return (
    <div>
      <h2 className="display text-2xl font-bold">{t("recordsTitle")}</h2>
      <div className="card mt-4 p-6">
        <RecordForm
          pilots={(pilots ?? []).map((p) => ({ id: p.id, label: p.name }))}
          events={(events ?? []).map((e) => ({ id: e.id, label: `${e.title} (${e.event_date})` }))}
        />
      </div>

      <h2 className="display mt-12 text-2xl font-bold">{t("recentRecords")}</h2>
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
    </div>
  );
}
